import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setStart, setSensor, setCase, setDrive, setEnd, setStepError } from '../store/slices/processStatusSlice';
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
  const dispatch = useAppDispatch();
  const processStatus = useAppSelector((state) => state.processStatus.processStatus);
  const currentCarId = useAppSelector((state) => state.processStatus.currentCarId);

  // end 타이머 참조
  const endTimerRef = useRef(null);

  useEffect(() => {
    const handleConnect = () => {
      console.log('🔌 Progress Socket Connected');
    };

    // progress 이벤트 처리 (백엔드에서 모든 진행 상태를 'progress' 이벤트로 보냄)
    const handleProgress = (data) => {
      console.log(' Progress Event:', data);
      
      if (!data || typeof data !== 'object') {
        return;
      }

      // start 처리: {start: 'ok', car_id: 2}
      if (data.start === 'ok' && data.car_id) {
        dispatch(setStart({ car_id: data.car_id }));
        return;
      }

      // sensor 처리: {sensor: 'ok'}
      // 단, 이미 error 상태면 덮어쓰지 않음
      if (data.sensor === 'ok') {
        // Redux slice에서 이미 error 상태면 덮어쓰지 않도록 처리됨
        dispatch(setSensor({ status: 'ok' }));
        return;
      }

      // case 처리: {case: 'ok'}
      if (data.case === 'ok') {
        dispatch(setCase({ status: 'ok' }));
        return;
      }

      // drive 처리: {drive: 'ok'}
      if (data.drive === 'ok') {
        dispatch(setDrive({ status: 'ok' }));
        
        // drive가 'ok'이면 5초 후 end를 'ok'로 설정
        // 기존 타이머가 있으면 클리어
        if (endTimerRef.current) {
          clearTimeout(endTimerRef.current);
        }
        
        // 5초 후 end를 'ok'로 설정
        endTimerRef.current = setTimeout(() => {
          dispatch(setEnd({ status: 'ok' }));
        }, 5000);
        return;
      }
    };

    // 센서 불량 이벤트 처리
    const handleSensorDefect = (data) => {
      console.log('⚠️ Sensor Defect Event:', data);
      if (data && data.car_id && currentCarId === data.car_id) {
        // device 필드나 type 필드를 확인하여 어떤 단계인지 판단
        const device = (data.device || '').toUpperCase();
        const type = (data.type || '').toLowerCase();
        let stepId = null;
        
        // 센서 확인 단계에 해당하는 장치들: LED, BUZZER, ULTRASONIC
        const sensorDevices = ['LED', 'BUZZER', 'ULTRASONIC'];
        if (sensorDevices.includes(device)) {
          stepId = 'sensor';
        }
        // 케이스 확인 단계에 해당하는 장치 (필요시 추가)
        else if (device.includes('CASE')) {
          stepId = 'case';
        }
        // 드라이브 확인 단계에 해당하는 장치: WHEEL
        else if (device === 'WHEEL' || device.includes('DRIVE')) {
          stepId = 'drive';
        }
        // device로 판단이 안 된 경우 type 필드 확인
        else if (type.includes('sensor') && !type.includes('case') && !type.includes('drive')) {
          stepId = 'sensor';
        } else if (type.includes('case')) {
          stepId = 'case';
        } else if (type.includes('drive')) {
          stepId = 'drive';
        }
        
        if (stepId) {
          // 기존 end 타이머가 있으면 클리어
          if (endTimerRef.current) {
            clearTimeout(endTimerRef.current);
            endTimerRef.current = null;
          }
          
          // 해당 단계를 'error'로 설정하고, end도 즉시 'error'로 설정
          dispatch(setStepError({ stepId }));
          dispatch(setEnd({ status: 'error' }));
        }
      }
    };


    const handleDisconnect = () => {
      console.log('🔌 Progress Socket Disconnected');
    };

    // 이벤트 리스너 등록
    socket.on('connect', handleConnect);
    socket.on('progress', handleProgress);
    socket.on('sensor_defect', handleSensorDefect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      // 이벤트 리스너 제거
      socket.off('connect', handleConnect);
      socket.off('progress', handleProgress);
      socket.off('sensor_defect', handleSensorDefect);
      socket.off('disconnect', handleDisconnect);
      
      // 타이머 정리
      if (endTimerRef.current) {
        clearTimeout(endTimerRef.current);
      }
    };
  }, [dispatch, currentCarId]);

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
              {/* start 단계일 때 왼쪽에 car_id 표시 */}
              {step.id === 'start' && currentCarId && (
                <div className={styles.carIdLabel}>차량: {currentCarId}</div>
              )}
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
