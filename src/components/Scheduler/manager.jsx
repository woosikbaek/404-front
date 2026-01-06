import { useState } from 'react';
import { format } from 'date-fns';
import styles from './manager.module.css';

const Manager = ({ date, selectedEmp, onClose, onSave }) => {
  const [type, setType] = useState('결근');

  // 시간 선택 옵션 (마우스 클릭용)
  const typeOptions = [
    { label: '출근', value: '출근', status: 'work' },
    { label: '휴가', value: '휴가', status: 'vacation' },
    { label: '반차', value: '반차', status: 'half' },
    { label: '결근', value: '결근', status: 'absent' },
    { label: '퇴근', value: '퇴근', status: 'leave' },
    { label: '지각', value: '지각', status: 'late' },
    { label: '연차', value: '연차', status: 'annual' },
    { label: '병가', value: '병가', status: 'sick' },
  ];

  const handleSave = () => {
    const selectedOption = typeOptions.find(opt => opt.value === type);

    const payload = {
      date: format(date, 'yyyy-MM-dd'),
      name: selectedEmp,
      type: selectedOption.value,
      status: selectedOption.status
    };
    onSave(payload);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3 className={styles.title}>{format(date, 'MM월 dd일')}</h3>
        <p className={styles.info}>대상: <strong>{selectedEmp}</strong></p>

        <div className={styles.section}>
          <div className={styles.buttonGrid}>
            {typeOptions.map(opt => (
              <button
                key={opt.value}
                className={`${styles.optBtn} ${type === opt.value ? styles.active : ''}`}
                onClick={() => setType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.saveBtn} onClick={handleSave}>저장하기</button>
          <button className={styles.closeBtn} onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default Manager;