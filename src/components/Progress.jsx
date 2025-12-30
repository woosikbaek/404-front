import React, { useEffect, useState } from 'react';
import styles from './Progress.module.css';
import socket from '../utils/socket';

// 공정 단계 정의
const PROCESS_STEPS = [
  { id: 'start', label: 'START' },
  { id: 'sensor', label: '센서 확인' },
  { id: 'case', label: '케이스 확인' },
  { id: 'drive', label: '드라이브 확인' },
  { id: 'end', label: 'END' }
];

function Progress() {
  const [processStatus, setProcessStatus] = useState({
    'start': 'pending',
    'sensor': 'pending',
    'case': 'pending',
    'drive': 'pending',
    'end': 'pending'
  });

  useEffect(() => {
    const handleConnect = () => {
      console.log('🔌 Progress Socket Connected');
    };

    // 공정 진행도 데이터 수신
    const handleProgress = (data) => {
      console.log(' Progress Data:', data);
      
      // 데이터 형식: { "공정명": "ok" 또는 "error" }
      if (data && typeof data === 'object') {
        setProcessStatus(prev => {
          const newStatus = { ...prev };
          
          Object.keys(data).forEach(processName => {
            const status = data[processName];
            if (status === 'ok' || status === 'error') {
              newStatus[processName] = status;
            }
          });
          
          return newStatus;
        });
      }
    };

    const handleDisconnect = () => {
      console.log(' Progress Socket Disconnected');
    };

    // 이벤트 리스너 등록
    socket.on('connect', handleConnect);
    socket.on('progress', handleProgress);
    socket.on('disconnect', handleDisconnect);

    return () => {
      // 이벤트 리스너 제거
      socket.off('connect', handleConnect);
      socket.off('progress', handleProgress);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const getStepStatus = (stepId) => {
    const status = processStatus[stepId];
    
    if (status === 'ok') {
      return 'completed';
    } else if (status === 'error') {
      return 'error';
    }
    
    return 'pending';
  };

  const getBarStatus = (index) => {
    const currentStepId = PROCESS_STEPS[index].id;
    const currentStatus = processStatus[currentStepId];
    
    if (currentStatus === 'ok') {
      return 'completed';
    }
    
    return 'pending';
  };

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        {PROCESS_STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* 공정 단계 원 */}
            <div className={styles.stepWrapper}>
              <div 
                className={`${styles.stepCircle} ${styles[getStepStatus(step.id)]}`}
              />
              <div className={styles.stepLabel}>{step.label}</div>
            </div>
            
            {/* 공정 단계 사이의 막대 (마지막 단계 제외) */}
            {index < PROCESS_STEPS.length - 1 && (
              <div 
                className={`${styles.stepBar} ${styles[getBarStatus(index)]}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default Progress;
