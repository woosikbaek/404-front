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
  const [activeTab, setActiveTab] = useState('CAMERA');

  const getImageUrl = (path) => {
    if (!path) return '';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE}/camera/${cleanPath}`;
  };

  /* ===============================
     1. 초기 불량 로그 로드
     기준: 이미지 있으면 외관 / 없으면 센서
     =============================== */
  useEffect(() => {
    fetch(`${API_BASE}/camera/defects`)
      .then(res => res.json())
      .then(data => {
        const normalized = data.map(log => {
          const isCamera = log.images && log.images.length > 0;

          return {
            ...log,
            isCamera,
            type: isCamera ? '외관불량' : log.type ?? '센서불량',
            images: log.images || []
          };
        });

        setLogs(normalized);
      })
      .catch(err => console.error('❌ FETCH ERROR:', err));
  }, []);

  /* ===============================
     2. 실시간 소켓 수신
     =============================== */
  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleCameraDefect = (data) => {
      setLogs(prev => [{
        ...data,
        isCamera: true,
        type: '외관불량',
        images: data.images || []
      }, ...prev]);

      if (activeTab === 'CAMERA') setCurrentPage(1);
    };

    const handleSensorDefect = (data) => {
      setLogs(prev => [{
        ...data,
        isCamera: false,
        type: `${(data.device || '센서').toUpperCase()} 센서불량`,
        images: []
      }, ...prev]);

      if (activeTab === 'SENSOR') setCurrentPage(1);
    };

    if (socket.connected) setConnected(true);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('camera_defect', handleCameraDefect);
    socket.on('sensor_defect', handleSensorDefect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('camera_defect', handleCameraDefect);
      socket.off('sensor_defect', handleSensorDefect);
    };
  }, [activeTab]);

  /* ===============================
     3. 탭 필터링
     =============================== */
  const filteredLogs = useMemo(() => {
    return activeTab === 'CAMERA'
      ? logs.filter(log => log.isCamera)
      : logs.filter(log => !log.isCamera);
  }, [logs, activeTab]);

  /* ===============================
     4. 페이지네이션
     =============================== */
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

        <div className={styles.logHeader}>
          <div className={styles.logColCar}>차량번호</div>
          <div className={styles.logColImage}>이미지</div>
          <div className={styles.logColType}>유형</div>
          <div className={styles.logColResult}>결과</div>
          <div className={styles.logColTime}>날짜</div>
        </div>

        <div className={styles.logList}>
          {pagedLogs.length === 0 ? (
            <div className={styles.noLogs}>
              표시할 {activeTab === 'CAMERA' ? '외관' : '센서'} 불량 로그 없음
            </div>
          ) : (
            pagedLogs.map((log, index) => (
              <div
                key={index}
                className={styles.logRow}
                onClick={() => setSelectedLog(log)}
              >
                <div className={styles.logColCar}>{log.car_id ?? '-'}</div>

                <div className={styles.logColImage}>
                  {log.images.length > 0 ? (
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
                  {log.type}
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

        {totalPages > 0 && (
          <div className={styles.pagination}>
            <button
              className={styles.navBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            >
              ‹
            </button>

            {Array.from(
              { length: endPage - startPage + 1 },
              (_, i) => startPage + i
            ).map(page => (
              <button
                key={page}
                className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''
                  }`}
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
      </div>
    </div>
  );
}

export default DefectLog;
