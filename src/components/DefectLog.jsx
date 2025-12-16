import { useState, useEffect } from 'react';
import './DefectLog.css';

function DefectLog({ isPowerOn }) {
  const [defects, setDefects] = useState([]);
  const [filters, setFilters] = useState({
    date: '',
    defectType: 'all',
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!isPowerOn) {
      return;
    }

    fetchDefects();
    
    // 30초마다 새로운 불량 데이터 확인
    const interval = setInterval(fetchDefects, 30000);
    return () => clearInterval(interval);
  }, [isPowerOn, filters]);

  const fetchDefects = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.defectType !== 'all') params.append('type', filters.defectType);

      const response = await fetch(`http://localhost:8080/api/defects?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDefects(data);
      }
    } catch (error) {
      console.error('불량 데이터 조회 오류:', error);
    }
  };

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

  const groupedDefects = groupByDate(defects);

  return (
    <div className="defect-log-container">
      <h2 className="defect-log-title">불량 검출 로그</h2>

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
            <button onClick={fetchDefects} className="refresh-button">
              🔄 새로고침
            </button>
          </div>

          <div className="defects-content">
            {defects.length === 0 ? (
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
