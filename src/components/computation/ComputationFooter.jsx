import styles from './ComputationFooter.module.css';

const ComputationFooter = () => {
  return (
    <div className={styles.footer}>
      <button
        className={styles.completeBtn}
        onClick={() => alert('검산이 완료되었습니다.')}
      >
        검산완료
      </button>
    </div>
  );
};

export default ComputationFooter;
