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
  const [connected, setConnected] = useState(socket.connected);
  const [activeTab, setActiveTab] = useState('CAMERA');

  // 필터 상태 관리
  const [searchCarId, setSearchCarId] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [filterYear, setFilterYear] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterSensorType, setFilterSensorType] = useState('all');

  const getImageUrl = (path) => {
    if (!path) return '';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE}/camera/${cleanPath}`;
  };

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

  useEffect(() => {
    setConnected(socket.connected);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('camera_defect', data => {
      setLogs(prev => [{ ...data, isCamera: true, type: '외관불량', images: data.images || [] }, ...prev]);
      if (activeTab === 'CAMERA') setCurrentPage(1);
    });

    socket.on('sensor_defect', data => {
      setLogs(prev => [{ ...data, isCamera: false, type: `${(data.device || '센서').toUpperCase()} 센서불량`, images: [] }, ...prev]);
      if (activeTab === 'SENSOR') setCurrentPage(1);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('camera_defect');
      socket.off('sensor_defect');
    };
  }, [activeTab]);

  // 필터링 로직 개선: 차량번호 완전 일치 처리
  const filteredAndSortedLogs = useMemo(() => {
    let result = logs.filter(l => (activeTab === 'CAMERA' ? l.isCamera : !l.isCamera));
    
    // [수정] 차량번호 검색: 값이 있을 때만 완전 일치(===) 검사
    if (searchCarId.trim() !== '') {
      result = result.filter(l => String(l.car_id) === searchCarId.trim());
    }

    if (activeTab === 'SENSOR' && filterSensorType !== 'all') {
      result = result.filter(l => l.type.includes(filterSensorType.toUpperCase()));
    }
    
    if (filterYear !== 'all') {
      result = result.filter(l => new Date(l.created_at).getFullYear() === parseInt(filterYear));
    }
    
    if (filterMonth !== 'all') {
      result = result.filter(l => new Date(l.created_at).getMonth() + 1 === parseInt(filterMonth));
    }

    result.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
    return result;
  }, [logs, activeTab, searchCarId, sortOrder, filterYear, filterMonth, filterSensorType]);

  const totalPages = Math.ceil(filteredAndSortedLogs.length / ITEMS_PER_PAGE);
  const currentGroup = Math.floor((currentPage - 1) / PAGES_PER_GROUP);
  const startPage = currentGroup * PAGES_PER_GROUP + 1;
  const endPage = Math.min(startPage + PAGES_PER_GROUP - 1, totalPages);
  const pagedLogs = filteredAndSortedLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  return (
    <div>
      <Header connected={connected} />
      <div className={styles.defectLogContainer}>
        <h2 className={styles.defectLogTitle}>불량 로그</h2>

        <div className={styles.filterSection}>
          <div className={styles.filterLeft}>
            <div className={styles.searchContainer}>
              <input 
                type="text" 
                className={styles.slimInput}
                placeholder="차량번호 정확히 입력" 
                value={searchCarId}
                onChange={(e) => { setSearchCarId(e.target.value); setCurrentPage(1); }}
              />
              {searchCarId && (
                <button className={styles.clearBtn} onClick={() => setSearchCarId('')}>✕</button>
              )}
            </div>
          </div>
          
          <div className={styles.filterRight}>
            <select className={styles.slimSelect} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>

            <select className={styles.slimSelect} value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}>
              <option value="all">전체 연도</option>
              {years.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>

            <select className={styles.slimSelect} value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}>
              <option value="all">전체 월</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>

            {activeTab === 'SENSOR' && (
              <select className={styles.slimSelect} value={filterSensorType} onChange={(e) => { setFilterSensorType(e.target.value); setCurrentPage(1); }}>
                <option value="all">모든 센서</option>
                <option value="LED">LED</option>
                <option value="BUZZER">BUZZER</option>
                <option value="WHEEL">WHEEL</option>
              </select>
            )}
          </div>
        </div>

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
            <div className={styles.noLogs}>조건에 맞는 데이터 없음</div>
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
          <button className={styles.navBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
            <button key={p} className={`${styles.pageBtn} ${p === currentPage ? styles.active : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
          ))}
          <button className={styles.navBtn} disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>›</button>
        </div>

        {selectedLog && (
          <div className={styles.imageModal} onClick={() => setSelectedLog(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button className={styles.modalClose} onClick={() => setSelectedLog(null)}>✕</button>
              <div className={styles.modalImageContainer}>
                {selectedLog.images.length > 0 ? (
                  selectedLog.images.map((img, i) => (
                    <img key={i} src={getImageUrl(img)} alt="detail" />
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