import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './DefectLog.css';

const API_BASE = 'http://192.168.1.78:5000';
const ITEMS_PER_PAGE = 8;
const PAGES_PER_GROUP = 10;
const userName = localStorage.getItem('name') || '---';

function DefectLog() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [connected, setConnected] = useState(false);

  /* =========================
     1. 초기 로그 (REST)
  ========================= */
  useEffect(() => {
    fetch(`${API_BASE}/camera/defects`)
      .then(res => res.json())
      .then(data => {
        console.log('📥 FETCH DATA:', data);
        setLogs(data);
      })
      .catch(err => {
        console.error('❌ FETCH ERROR:', err);
      });
  }, []);

  /* =========================
     2. 실시간 로그 (Socket)
  ========================= */
  useEffect(() => {
    const socket = io(API_BASE, { transports: ['websocket'] });

    socket.on('connect', () => {
      console.log('🔌 SOCKET CONNECTED');
      setConnected(true);
    });

    socket.on('camera_defect', data => {
      console.log('🚨 SOCKET DATA:', data);
      setLogs(prev => [data, ...prev]);
      setCurrentPage(1);
    });

    socket.on('disconnect', () => {
      console.log('🔌 SOCKET DISCONNECTED');
      setConnected(false);
    });

    return () => socket.disconnect();
  }, []);

  /* =========================
     3. 페이지네이션 계산
  ========================= */
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const currentGroup = Math.floor((currentPage - 1) / PAGES_PER_GROUP);
  const startPage = currentGroup * PAGES_PER_GROUP + 1;
  const endPage = Math.min(startPage + PAGES_PER_GROUP - 1, totalPages);

  const pagedLogs = logs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      {/* ============ HEADER ============ */}
      <header className="header">
        <div className="header-content">
          <h1>자동차 검사 실시간 대시보드</h1>
          <p className="header-subtitle">센서 및 외관 검사 통계</p>
        </div>
        <div className="worker-info" style={{ color: '#222', fontWeight: 500, marginTop: 8, marginBottom: 4 }}>
          근무자 : {userName}
        </div>
        <div className="connection-status">
          <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {connected ? '연결됨' : '연결 끊김'}
          </span>
        </div>
      </header>
      <div className="defect-log-container">
        <h2 className="defect-log-title">불량 로그</h2>

        {/* ===== 헤더 ===== */}
        <div className="log-header">
          <div className="log-col car">차량번호</div>
          <div className="log-col preview">이미지</div>
          <div className="log-col result_text">결과</div>
          <div className="log-col time">날짜</div>
        </div>

        {/* ===== 리스트 ===== */}
        <div className="log-list">
          {pagedLogs.length === 0 && <div className="no-logs">표시할 로그 없음</div>}

          {pagedLogs.map((log, index) => {
            const imageUrl = log.image
              ? `${API_BASE}/camera${log.image}`
              : null;

            return (
              <div
                key={index}
                className="log-row"
                onClick={() => setSelectedLog(log)}
              >
                <div className="log-col car">{log.car_id}</div>
                <div className="log-col preview">
                  {imageUrl ? (
                    <img
                      className="preview-img"
                      src={imageUrl}
                      alt="preview"
                      onError={() => console.error('❌ IMAGE FAIL:', imageUrl)}
                    />
                  ) : (
                    <div className="preview-placeholder">-</div>
                  )}
                </div>
                <div className="log-col result">{log.result ?? '-'}</div>
                <div className="log-col time">
                  {log.created_at
                    ? new Date(log.created_at).toLocaleString('ko-KR')
                    : '-'}
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== 페이지네이션 ===== */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            >
              ‹
            </button>

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
              <button
                key={page}
                className={`page-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            >
              ›
            </button>
          </div>
        )}

        {/* ===== 이미지 모달 ===== */}
        {selectedLog && (
          <div className="image-modal" onClick={() => setSelectedLog(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedLog(null)}>✕</button>
              {selectedLog.image ? (
                <img className="modal-image" src={`${API_BASE}/camera${selectedLog.image}`} alt="detail" />
              ) : (
                <div className="no-image">이미지 없음</div>
              )}
              <div className="modal-info">
                <p><strong>차량번호:</strong> {selectedLog.car_id}</p>
                <p><strong>결과:</strong> {selectedLog.result ?? '-'}</p>
                <p><strong>날짜:</strong> {new Date(selectedLog.created_at).toLocaleString('ko-KR')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DefectLog;