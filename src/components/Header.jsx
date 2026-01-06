import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';

function Header({ connected = false }) {
  const userName = localStorage.getItem('name') || '---';
  
  // 1. 출근 상태 관리 (초기값은 localStorage나 서버 데이터로 설정 가능)
  const [isCommuted, setIsCommuted] = useState(false);

  // 2. 출/퇴근 핸들러
  const commuteHandler = async () => {
    const type = isCommuted ? '퇴근' : '출근';
    
    // 사용자 확인
    if (!window.confirm(`${type} 처리하시겠습니까?`)) return;

    try {
      // 비동기 통신 (출근은 POST, 퇴근은 PATCH/PUT 등 서버 규약에 맞게 설정)
      const response = await fetch('/commute', {
        method: isCommuted ? 'PUT' : 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          type: type,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert(`${type} 처리되었습니다.`);
        setIsCommuted(!isCommuted); // 상태 토글
      } else {
        alert(`${type} 처리에 실패했습니다.`);
      }
    } catch (error) {
      console.error('근태 관리 통신 에러:', error);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1>자동차 검사 실시간 대시보드</h1>
        <p className={styles.headerSubtitle}>센서 및 외관 검사 통계</p>
      </div>

      <div className={styles.commuteSection}>
        {/* 상태에 따라 클래스와 텍스트가 변경되는 토글 버튼 */}
        <button 
          onClick={commuteHandler}
          className={`${styles.commuteBtn} ${isCommuted ? styles.leave : styles.work}`}
        >
          {isCommuted ? '퇴근하기' : '출근하기'}
        </button>
      </div>

      <div className={styles.workerInfo}>
        근무자 : {userName}
      </div>

      <div className={styles.connectionStatus}>
        <span className={`${styles.status} ${connected ? styles.connected : styles.disconnected}`}>
          <span className={styles.statusDot}></span>
          {connected ? '연결됨' : '연결 끊김'}
        </span>
      </div>
    </header>
  );
}

export default Header;