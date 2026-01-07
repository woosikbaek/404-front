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
  // ✅ 소켓 객체의 현재 연결 상태를 초기값으로 직접 사용
  const [connected, setConnected] = useState(socket.connected);
  const [activeTab, setActiveTab] = useState('CAMERA');

  const getImageUrl = (path) => {
    if (!path) return '';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE}/camera/${cleanPath}`;
  };

  // 1. 초기 데이터 로드
  useEffect(() => {
    fetch(`${API_BASE}/camera/defects`)
      .then(res => res.json())
      .then(data => {
        const normalized = data.map(log => {
          const isCamera = log.images && log.images.length > 0;
          return {
            ...log,
            isCamera,
            type: isCamera ? '외관불량' : (log.type ?? '센서불량'),
            images: log.images || []
          };
        });
        setLogs(normalized);
      })
      .catch(err => console.error('FETCH ERROR:', err));
  }, []);

  // 2. 실시간 소켓 수신 및 연결 상태 관리
  useEffect(() => {
    // 마운트 시점 상태 확인
    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('camera_defect', data => {
      setLogs(prev => [{ 
        ...data, 
        isCamera: true, 
        type: '외관불량', 
        images: data.images || [] 
      }, ...prev]);
      if (activeTab === 'CAMERA') setCurrentPage(1);
    });

    socket.on('sensor_defect', data => {
      setLogs(prev => [{ 
        ...data, 
        isCamera: false, 
        type: `${(data.device || '센서').toUpperCase()} 센서불량`, 
        images: [] 
      }, ...prev]);
      if (activeTab === 'SENSOR') setCurrentPage(1);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('camera_defect');
      socket.off('sensor_defect');
    };
  }, [activeTab]);

  const filteredLogs = useMemo(() => {
    return activeTab === 'CAMERA' 
      ? logs.filter(l => l.isCamera) 
      : logs.filter(l => !l.isCamera);
  }, [logs, activeTab]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const currentGroup = Math.floor((currentPage - 1) / PAGES_PER_GROUP);
  const startPage = currentGroup * PAGES_PER_GROUP + 1;
  const endPage = Math.min(startPage + PAGES_PER_GROUP - 1, totalPages);
  const pagedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <Header connected={connected} />
      <div className={styles.defectLogContainer}>
        <h2 className={styles.defectLogTitle}>불량 로그</h2>

        <div className={styles.tabMenu}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'CAMERA' ? styles.activeTab : ''}`} 
            onClick={() => { setActiveTab('CAMERA'); setCurrentPage(1); }}
          >
            외관 불량
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'SENSOR' ? styles.activeTab : ''}`} 
            onClick={() => { setActiveTab('SENSOR'); setCurrentPage(1); }}
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
            <div className={styles.noLogs}>데이터 없음</div>
          ) : (
            pagedLogs.map((log, idx) => (
              <div key={idx} className={styles.logRow} onClick={() => setSelectedLog(log)}>
                <div className={styles.logColCar}>{log.car_id ?? '-'}</div>
                <div className={styles.logColImage}>
                  {log.images.length > 0 ? (
                    log.images.slice(0, 2).map((img, i) => (
                      <img key={i} src={getImageUrl(img)} className={styles.previewImg} alt="defect" />
                    ))
                  ) : (
                    <div className={styles.previewPlaceholder}>-</div>
                  )}
                </div>
                <div className={styles.logColType} style={{ color: 'red' }}>{log.type}</div>
                <div className={styles.logColResult} style={{ color: 'red' }}>{log.result ?? '-'}</div>
                <div className={styles.logColTime}>
                  {log.created_at ? new Date(log.created_at).toLocaleString('ko-KR') : '-'}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.pagination}>
          <button 
            className={styles.navBtn} 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
          >
            ‹
          </button>
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
            <button 
              key={p} 
              className={`${styles.pageBtn} ${p === currentPage ? styles.active : ''}`} 
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ))}
          <button 
            className={styles.navBtn} 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
          >
            ›
          </button>
        </div>

        {selectedLog && (
          <div className={styles.imageModal} onClick={() => setSelectedLog(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button className={styles.modalClose} onClick={() => setSelectedLog(null)}>✕</button>
              <div className={styles.modalImageContainer}>
                {selectedLog.images.length > 0 ? (
                  selectedLog.images.map((img, i) => (
                    <img 
                      key={i} 
                      src={getImageUrl(img)} 
                      alt="detail" 
                      style={{ maxWidth: selectedLog.images.length === 1 ? '95%' : '48%' }} 
                    />
                  ))
                ) : (
                  <div className={styles.noImage}>이미지 없음</div>
                )}
              </div>
              <div className={styles.modalInfo}>
                <p><b>차량번호:</b> {selectedLog.car_id ?? '-'}</p>
                <p><b>유형:</b> {selectedLog.type}</p>
                <p><b>결과:</b> {selectedLog.result ?? '-'}</p>
                <p><b>날짜:</b> {selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString('ko-KR') : '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DefectLog;