import { useState } from 'react';
import { format } from 'date-fns';
import styles from './manager.module.css';

const Manager = ({ date, selectedEmp, onClose, onSave }) => {
  const [type, setType] = useState('결근');

  const typeOptions = [
    { label: '출근', value: '출근' },
    { label: '휴가', value: '휴가' },
    { label: '반차', value: '반차' },
    { label: '결근', value: '결근' },
    { label: '퇴근', value: '퇴근' },
    { label: '지각', value: '지각' },
    { label: '연차', value: '연차' },
    { label: '병가', value: '병가' },
    { label: '삭제', value: ''},
  ];

  const handleSave = () => {
    if (!selectedEmp || selectedEmp.id === 'all') {
      alert('사원을 선택 해 주세요.');
      return;
    }

    const selectedOption = typeOptions.find(opt => opt.value === type);
    
    const payload = {
      employeeId: selectedEmp.id,
      date: format(date, 'yyyy-MM-dd'),
      status: selectedOption.value,
    };
    onSave(payload);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3 className={styles.title}>{format(date, 'MM월 dd일')}</h3>
        <p className={styles.info}>이름: <strong>{selectedEmp ? selectedEmp.name : '선택된 사원 없음'}</strong></p>

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