import styles from './ComputationHeader.module.css';

const ComputationHeader = ({ onRefresh }) => {
  return (
    <header className={styles.header}>
      <h2>근태 및 급여 정산 대시보드</h2>
      <button onClick={onRefresh} className={styles.refreshBtn}>데이터 새로고침</button>
    </header>
  );
};

export default ComputationHeader;
