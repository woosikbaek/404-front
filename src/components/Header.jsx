import styles from './Header.module.css';

function Header({ connected = false, }) {
  const userName = localStorage.getItem('name') || '---';

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1>자동차 검사 실시간 대시보드</h1>
        <p className={styles.headerSubtitle}>센서 및 외관 검사 통계</p>
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

