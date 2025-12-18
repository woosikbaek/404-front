import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './DefectLog.css';

function DefectLog({ isPowerOn }) {
  const [defects, setDefects] = useState([]);
  const [filters, setFilters] = useState({
    date: '',
    defectType: 'all',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isPowerOn) {
      setDefects([]);
      setConnected(false);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Socket.IO 연결
    socketRef.current = io('http://192.168.1.78:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('🟢 DefectLog 웹소켓 연결됨');
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔴 DefectLog 웹소켓 연결 해제됨');
      setConnected(false);
    });

    // 초기 불량 데이터 수신
    socketRef.current.on('initial_defects', (data) => {
      console.log('📋 초기 불량 데이터 수신:', data);
      setDefects(data);
    });

    // 실시간 불량 데이터 업데이트
    socketRef.current.on('defect_update', (data) => {
      console.log('🔴 새로운 불량 감지:', data);
      setDefects(prevDefects => [data, ...prevDefects]);
    });

    // 센서 불량 데이터
    socketRef.current.on('sensor_defect', (data) => {
      console.log('⚠️ 센서 불량:', data);
      setDefects(prevDefects => [data, ...prevDefects]);
    });

    // 카메라 불량 데이터
    socketRef.current.on('camera_defect', (data) => {
      console.log('📷 카메라 불량:', data);
      setDefects(prevDefects => [data, ...prevDefects]);
    });

    socketRef.current.on('error', (error) => {
      console.error('웹소켓 오류:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isPowerOn]);

  const defectTypes = [
    { value: 'all', label: '전체' },
    { value: 'scratch', label: '스크래치' },
    { value: 'crack', label: '균열' },
    { value: 'deformation', label: '변형' },
    { value: 'contamination', label: '오염' },
    { value: 'misalignment', label: '불량 정렬' },
    { value: 'other', label: '기타' },
  ];

  const getDefectTypeLabel = (type) => {
    return defectTypes.find(t => t.value === type)?.label || type;
  };

  const getDefectColor = (type) => {
    const colors = {
      scratch: '#ef4444',
      crack: '#f59e0b',
      deformation: '#8b5cf6',
      contamination: '#ec4899',
      misalignment: '#3b82f6',
      other: '#6b7280',
    };
    return colors[type] || '#6b7280';
  };

  const groupByDate = (defects) => {
    return defects.reduce((groups, defect) => {
      const date = new Date(defect.timestamp).toLocaleDateString('ko-KR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(defect);
      return groups;
    }, {});
  };

  const filterDefects = () => {
    let filtered = [...defects];

    // 날짜 필터
    if (filters.date) {
      filtered = filtered.filter(defect => {
        const defectDate = new Date(defect.timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD
        return defectDate === filters.date;
      });
    }

    // 불량 유형 필터
    if (filters.defectType !== 'all') {
      filtered = filtered.filter(defect => defect.type === filters.defectType);
    }

    return filtered;
  };

  const filteredDefects = filterDefects();
  const groupedDefects = groupByDate(filteredDefects);

  return (
    <div className="defect-log-container">
      <div className="defect-log-header">
        <h2 className="defect-log-title">불량 검출 로그</h2>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢 연결됨' : '🔴 연결 안됨'}
        </div>
      </div>

      {!isPowerOn ? (
        <div className="defect-log-idle">
          <p className="idle-message">시스템이 꺼져있습니다</p>
        </div>
      ) : (
        <>
          <div className="filter-section">
            <div className="filter-group">
              <label htmlFor="date-filter">날짜 필터:</label>
              <input
                id="date-filter"
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="date-input"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="type-filter">불량 유형:</label>
              <select
                id="type-filter"
                value={filters.defectType}
                onChange={(e) => setFilters({ ...filters, defectType: e.target.value })}
                className="type-select"
              >
                {defectTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="defects-count">
              총 {filteredDefects.length}개의 불량
            </div>
          </div>

          <div className="defects-content">
            {filteredDefects.length === 0 ? (
              <div className="no-defects">
                <p>검출된 불량이 없습니다</p>
              </div>
            ) : (
              Object.keys(groupedDefects).map(date => (
                <div key={date} className="date-group">
                  <h3 className="date-header">{date}</h3>
                  <div className="defects-grid">
                    {groupedDefects[date].map(defect => (
                      <div 
                        key={defect.id} 
                        className="defect-card"
                        onClick={() => setSelectedImage(defect)}
                      >
                        <div className="defect-image-wrapper">
                          <img
                            src={defect.imageUrl || '/placeholder-defect.jpg'}
                            alt={`불량 검출 ${defect.id}`}
                            className="defect-image"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E이미지 없음%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div 
                            className="defect-type-badge"
                            style={{ backgroundColor: getDefectColor(defect.type) }}
                          >
                            {getDefectTypeLabel(defect.type)}
                          </div>
                        </div>
                        <div className="defect-info">
                          <div className="defect-time">
                            {new Date(defect.timestamp).toLocaleTimeString('ko-KR')}
                          </div>
                          <div className="defect-details">
                            <span className="detail-label">위치:</span>
                            <span className="detail-value">{defect.location || 'N/A'}</span>
                          </div>
                          {defect.severity && (
                            <div className="defect-severity">
                              심각도: <span className={`severity-${defect.severity}`}>
                                {defect.severity}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedImage && (
            <div className="image-modal" onClick={() => setSelectedImage(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedImage(null)}>
                  ✕
                </button>
                <img
                  src={selectedImage.imageUrl}
                  alt={`불량 상세 ${selectedImage.id}`}
                  className="modal-image"
                />
                <div className="modal-info">
                  <h3>{getDefectTypeLabel(selectedImage.type)}</h3>
                  <p>시간: {new Date(selectedImage.timestamp).toLocaleString('ko-KR')}</p>
                  <p>위치: {selectedImage.location}</p>
                  {selectedImage.description && (
                    <p>설명: {selectedImage.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DefectLog;
