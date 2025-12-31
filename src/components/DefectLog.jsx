import { useEffect, useState, useMemo } from 'react';
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
  
  // 탭 상태: 'CAMERA'(외관불량), 'SENSOR'(센서불량)
  const [activeTab, setActiveTab] = useState('CAMERA');

  const getImageUrl = (path) => {
    if (!path) return '';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE}/camera/${cleanPath}`;
  };

  // 1. 초기 데이터 로드
  useEffect(() => {
    fetch(`${API_BASE}/camera/defects`)
      .then(res => res.json())
      .then(data => {
        setLogs(data);
      })
      .catch(err => console.error('❌ FETCH ERROR:', err));
  }, []);

  // 2. 실시간 소켓 통신
  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleCameraDefect = (data) => {
      setLogs(prev => [{
        ...data,
        type: '외관불량',
        images: data.images || [],
        isCamera: true 
      }, ...prev]);
      if (activeTab === 'CAMERA') setCurrentPage(1);
    };

    const handleSensorDefect = (data) => {
      setLogs(prev => [{
        ...data,
        type: `${data.device} 센서불량`,
        images: [],
        isCamera: false
      }, ...prev]);
      if (activeTab === 'SENSOR') setCurrentPage(1);
    };

    if (socket.connected) setConnected(true);

    socket.on('connect', handleConnect);
    socket.on('camera_defect', handleCameraDefect);
    socket.on('sensor_defect', handleSensorDefect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('camera_defect', handleCameraDefect);
      socket.off('sensor_defect', handleSensorDefect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [activeTab]);

  // 3. 탭에 따른 데이터 필터링 (useMemo로 성능 최적화)
  const filteredLogs = useMemo(() => {
    if (activeTab === 'CAMERA') {
      // 이미지 데이터가 있거나 타입이 외관불량인 경우
      return logs.filter(log => log.images && log.images.length > 0);
    } else {
      // 이미지가 없거나 타입에 센서불량이 포함된 경우
      return logs.filter(log => !log.images || log.images.length === 0);
    }
  }, [logs, activeTab]);

  // 4. 페이지네이션 계산
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const currentGroup = Math.floor((currentPage - 1) / PAGES_PER_GROUP);
  const startPage = currentGroup * PAGES_PER_GROUP + 1;
  const endPage = Math.min(startPage + PAGES_PER_GROUP - 1, totalPages);

  const pagedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div>
      <Header connected={connected} />
      <div className={styles.defectLogContainer}>
        <h2 className={styles.defectLogTitle}>불량 로그</h2>

        {/* ===== 탭 메뉴 ===== */}
        <div className={styles.tabMenu}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'CAMERA' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('CAMERA')}
          >
            외관 불량
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'SENSOR' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('SENSOR')}
          >
            센서 불량
          </button>
        </div>

        {/* ===== 로그 헤더: 그리드 유지 ===== */}
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
            <div className={styles.noLogs}>표시할 {activeTab === 'CAMERA' ? '외관' : '센서'} 불량 로그 없음</div>
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
                      />
                    ))
                  ) : (
                    <div className={styles.previewPlaceholder}>-</div>
                  )}
                </div>

                <div className={styles.logColType} style={{ color: 'red' }}>
                  {log.type || '불량'}
                </div>
                
                <div className={styles.logColResult} style={{ color: 'red' }}>
                  {log.result ?? '-'}
                </div>
                
                <div className={styles.logColTime}>
                  {log.created_at ? new Date(log.created_at).toLocaleString('ko-KR') : '-'}
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

        {/* ===== 상세 모달 ===== */}
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
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.noImage}>
                  이미지 데이터가 없는 로그입니다.
                </div>
              )}

              <div className={styles.modalInfo}>
                <p><strong>차량번호:</strong> {selectedLog.car_id}</p>
                <p><strong>유형:</strong> {selectedLog.type}</p>
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