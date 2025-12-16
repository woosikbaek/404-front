import { useState } from 'react';
import './PowerToggle.css';

function PowerToggle({ onPowerChange }) {
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    const newPowerState = !isPowerOn;
    
    // 현재 상태에 따라 엔드포인트 결정
    const endpoint = isPowerOn 
      ? 'http://192.168.1.78:5000/front/power/off' 
      : 'http://192.168.1.78:5000/front/power/on';
    
    try {
      // 백엔드 API 호출
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ power: newPowerState }),
      });

      if (response.ok) {
        setIsPowerOn(newPowerState);
        if (onPowerChange) {
          onPowerChange(newPowerState);
        }
      } else {
        alert('전원 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('전원 제어 오류:', error);
      alert('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="power-toggle-container">
      <div className="power-status">
        <span className="status-label">공정 시스템 상태:</span>
        <span className={`status-indicator ${isPowerOn ? 'on' : 'off'}`}>
          {isPowerOn ? 'ON' : 'OFF'}
        </span>
      </div>
      <button
        className={`power-button ${isPowerOn ? 'on' : 'off'} ${isLoading ? 'loading' : ''}`}
        onClick={handleToggle}
        disabled={isLoading}
      >
        <div className="button-inner">
          {isLoading ? (
            <span>처리 중...</span>
          ) : (
            <>
              <span className="power-icon">{isPowerOn ? '⏻' : '⏽'}</span>
              <span className="power-text">{isPowerOn ? '전원 끄기' : '전원 켜기'}</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}

export default PowerToggle;
