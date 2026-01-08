import styles from './LeaveConfirmModal.module.css';

const LeaveConfirmModal = ({ modalData, onConfirm, onCancel }) => {
  if (!modalData) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>근태 적용 확인</h3>
        <p className={styles.modalMessage}>
          <strong>{modalData.emp.name}</strong> 님의 <br />
          <span className={styles.highlight}>{modalData.type}</span>를 1회 차감하시겠습니까?
        </p>
        <div className={styles.modalBtns}>
          <button className={styles.confirmBtn} onClick={onConfirm}>확인</button>
          <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default LeaveConfirmModal;
