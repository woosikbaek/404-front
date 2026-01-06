import React, { useState } from 'react';
import styles from './Header.module.css';
import { id } from 'date-fns/locale';

function Header({ connected = false }) {
  const userName = localStorage.getItem('name') || '---';
  
  // 1. 출근 상태 관리 (초기값)
  const [isCommuted, setIsCommuted] = useState(false);

  // 2. 출/퇴근 핸들러
  const commuteHandler = async () => {
    const isCheckingIn = !isCommuted; // 현재 상태가 false면 출근 시도
    const type = isCheckingIn ? '출근' : '퇴근';
    
    // URL 설정
    const API_URL = isCheckingIn 
      ? 'http://192.168.1.78:8080/api/attendance/check-in' 
      : 'http://192.168.1.78:8080/api/attendance/check-out';

    // 사용자 확인
    if (!window.confirm(`${type} 처리하시겠습니까?`)) return;

    // 로컬스토리지에서 사원 ID 가져오기
    const employeeId = localStorage.getItem('employeeId');
    console.log(employeeId);

    if (!employeeId) {
      alert("사원 정보(ID)를 찾을 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          id: employeeId,
        })
      });

      if (response.ok) {
        alert(`${type} 처리되었습니다.`);
        setIsCommuted(!isCommuted); // 성공 시에만 버튼 토글
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`${type} 처리에 실패했습니다. (사유: ${errorData.message || '서버 오류'})`);
      }
    } catch (error) {
      console.error('근태 관리 통신 에러:', error);
      alert('서버와 연결할 수 없습니다. IP 주소와 네트워크를 확인해주세요.');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1>자동차 검사 실시간 대시보드</h1>
        <p className={styles.headerSubtitle}>센서 및 외관 검사 통계</p>
      </div>

      <div className={styles.commuteSection}>
        <button 
          onClick={commuteHandler}
          className={`${styles.commuteBtn} ${isCommuted ? styles.leave : styles.work}`}
        >
          <span className={styles.btnDot}></span>
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