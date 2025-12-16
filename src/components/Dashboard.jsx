import { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ isPowerOn }) {
  const [progressData, setProgressData] = useState({
    currentStep: 0,
    totalSteps: 0,
    percentage: 0,
    processName: '',
    status: 'idle',
    startTime: null,
    estimatedEndTime: null,
  });

  useEffect(() => {
    if (!isPowerOn) {
      setProgressData({
        currentStep: 0,
        totalSteps: 0,
        percentage: 0,
        processName: '',
        status: 'idle',
        startTime: null,
        estimatedEndTime: null,
      });
      return;
    }

    // 백엔드에서 실시간 공정 진행도 데이터 가져오기
    const fetchProgress = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/process/progress');
        if (response.ok) {
          const data = await response.json();
          setProgressData(data);
        }
      } catch (error) {
        console.error('진행도 조회 오류:', error);
      }
    };

    // 초기 데이터 로드
    fetchProgress();

    // 5초마다 데이터 갱신
    const interval = setInterval(fetchProgress, 5000);

    return () => clearInterval(interval);
  }, [isPowerOn]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return '#10b981';
      case 'paused':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'completed':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'running':
        return '진행 중';
      case 'paused':
        return '일시 정지';
      case 'error':
        return '오류 발생';
      case 'completed':
        return '완료';
      default:
        return '대기 중';
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">공정 진행 현황</h2>
      
      <div className="dashboard-content">
        {!isPowerOn ? (
          <div className="dashboard-idle">
            <p className="idle-message">시스템이 꺼져있습니다</p>
            <p className="idle-hint">전원을 켜서 공정을 시작하세요</p>
          </div>
        ) : (
          <>
            <div className="progress-header">
              <div className="process-info">
                <h3 className="process-name">
                  {progressData.processName || '공정 대기 중...'}
                </h3>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(progressData.status) }}
                >
                  {getStatusText(progressData.status)}
                </span>
              </div>
              <div className="time-info">
                {progressData.startTime && (
                  <div className="time-item">
                    <span className="time-label">시작 시간:</span>
                    <span className="time-value">{new Date(progressData.startTime).toLocaleTimeString()}</span>
                  </div>
                )}
                {progressData.estimatedEndTime && (
                  <div className="time-item">
                    <span className="time-label">예상 완료:</span>
                    <span className="time-value">{new Date(progressData.estimatedEndTime).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar-wrapper">
                <div 
                  className="progress-bar-fill"
                  style={{ 
                    width: `${progressData.percentage}%`,
                    backgroundColor: getStatusColor(progressData.status)
                  }}
                >
                  <span className="progress-text">{progressData.percentage}%</span>
                </div>
              </div>
              <div className="step-info">
                <span>{progressData.currentStep} / {progressData.totalSteps} 단계</span>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-label">현재 단계</div>
                  <div className="stat-value">{progressData.currentStep}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-label">전체 단계</div>
                  <div className="stat-value">{progressData.totalSteps}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                  <div className="stat-label">진행률</div>
                  <div className="stat-value">{progressData.percentage}%</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
