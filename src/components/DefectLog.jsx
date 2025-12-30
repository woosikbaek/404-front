import { useEffect, useState } from 'react';
import Header from './Header';
import styles from './DefectLog.module.css';
import socket from '../utils/socket';

const API_BASE = 'http://192.168.1.78:5000';
const ITEMS_PER_PAGE = 8;
const PAGES_PER_GROUP = 10;

function DefectLog() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [connected, setConnected] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return '';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE}/camera/${cleanPath}`;
  };

  /* =========================
     1. 초기 로그 (REST) HTTP 통신
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
     2. 실시간 로그 (Socket) 웹소켓 통신
  ========================= */
  useEffect(() => {
    const handleConnect = () => {
      console.log('🔌 SOCKET CONNECTED');
      setConnected(true);
    };

    const handleCameraDefect = (data) => {
      console.log('🚨 SOCKET DATA (camera_defect):', data);
      setLogs(prev => [{
        car_id: data.car_id,
        type: '외관불량',
        result: data.result,
        images: data.images || [],
        created_at: data.created_at,
      }, ...prev]);
      setCurrentPage(1);
    };

    const handleSensorDefect = (data) => {
      console.log('🚨 SOCKET DATA (sensor_defect):', data);
      setLogs(prev => [{
        car_id: data.car_id,
        type: `${data.device} 센서불량`,
        result: data.result,
        images: [],
        created_at: data.created_at,
      }, ...prev]);
      setCurrentPage(1);
    };

    const handleDisconnect = () => {
      console.log('🔌 SOCKET DISCONNECTED');
      setConnected(false);
    };

    // 이미 연결되어 있으면 연결 상태 설정
    if (socket.connected) {
      setConnected(true);
    }

    // 이벤트 리스너 등록
    socket.on('connect', handleConnect);
    socket.on('camera_defect', handleCameraDefect);
    socket.on('sensor_defect', handleSensorDefect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      // 이벤트 리스너 제거
      socket.off('connect', handleConnect);
      socket.off('camera_defect', handleCameraDefect);
      socket.off('sensor_defect', handleSensorDefect);
      socket.off('disconnect', handleDisconnect);
    };
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
      <Header connected={connected} />
      <div className={styles.defectLogContainer}>
        <h2 className={styles.defectLogTitle}>불량 로그</h2>

        {/* ===== logHeader ===== */}
        <div className={styles.logHeader}>
          <div className={styles.logColCar}>차량번호</div>
          <div className={styles.logColImage}>이미지</div>
          <div className={styles.logColType}>유형</div>
          <div className={styles.logColResult}>결과</div>
          <div className={styles.logColTime}>날짜</div>
        </div>

        {/* ===== 리스트 ===== */}
        <div className={styles.logList}>
          {pagedLogs.length === 0 ? (
            <div className={styles.noLogs}>표시할 로그 없음</div>
          ) : (
            pagedLogs.map((log, index) => (
              <div
                key={index}
                className={styles.logRow}
                onClick={() => setSelectedLog(log)}
              >
                <div className={styles.logColCar}>{log.car_id || '-'}</div>
                
                <div className={styles.logColImage}>
                  {log.images && log.images.length > 0 ? (
                    log.images.slice(0, 2).map((img, idx) => (
                      <img
                        key={idx}
                        className={styles.previewImg}
                        src={getImageUrl(img)}
                        alt="preview"
                        onError={() => console.error('❌ IMAGE FAIL:', getImageUrl(img))}
                      />
                    ))
                  ) : (
                    <div className={styles.previewPlaceholder}>-</div>
                  )}
                </div>

                <div className={styles.logColType} style={{ color: 'red' }}>
                  {log.type || '외관불량'}
                </div>
                
                <div className={styles.logColResult} style={{ color: 'red' }}>
                  {log.result ?? '-'}
                </div>
                
                <div className={styles.logColTime}>
                  {log.created_at
                    ? new Date(log.created_at).toLocaleString('ko-KR')
                    : '-'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ===== 페이지네이션 ===== */}
        {totalPages > 0 && (
          <div className={styles.pagination}>
            <button
              className={styles.navBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            >
              ‹
            </button>

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
              <button
                key={page}
                className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className={styles.navBtn}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            >
              ›
            </button>
          </div>
        )}

        {/* ===== 이미지 모달 ===== */}
        {selectedLog && (
          <div className={styles.imageModal} onClick={() => setSelectedLog(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button className={styles.modalClose} onClick={() => setSelectedLog(null)}>✕</button>
              {selectedLog.images && selectedLog.images.length > 0 ? (
                <div className={styles.modalImageContainer}>
                  {selectedLog.images.slice(0, 2).map((img, idx) => (
                    <img
                      key={idx}
                      className={styles.modalImage}
                      src={getImageUrl(img)}
                      alt="detail"
                      onError={() => console.error('❌ IMAGE FAIL:', getImageUrl(img))}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.noImage}>이미지 없음</div>
              )}
              <div className={styles.modalInfo}>
                <p><strong>차량번호:</strong> {selectedLog.car_id}</p>
                <p><strong>유형:</strong> {selectedLog.type || '외관불량'}</p>
                <p><strong>결과:</strong> {selectedLog.result ?? '-'}</p>
                <p><strong>날짜:</strong> {selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString('ko-KR') : '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DefectLog;