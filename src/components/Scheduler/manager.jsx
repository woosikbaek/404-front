import { useState } from 'react';
import { format } from 'date-fns';

const AttendanceModal = ({ date, selectedEmp, onClose, onSave }) => {
  const [type, setType] = useState('출근');
  const [time, setTime] = useState('09:00');

  // 시간 선택 옵션 (마우스 클릭용)
  const timeOptions = ['08:00', '08:30', '09:00', '09:30', '10:00'];
  const typeOptions = [
    { label: '✅ 출근', value: '출근', status: 'work' },
    { label: '🏖️ 휴가', value: '휴가', status: 'vacation' },
    { label: '🌓 반차', value: '반차', status: 'half' },
    { label: '🚫 결근', value: '결근', status: 'absent' }
  ];

  const handleSave = () => {
    onSave({
      date: format(date, 'yyyy-MM-dd'),
      name: selectedEmp === "근무자 선택" ? "우시크" : selectedEmp,
      type: type,
      time: type === '출근' ? time : null,
      status: typeOptions.find(t => t.value === type).status
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3>{format(date, 'MM월 dd일')} 근태 설정</h3>
        <p className={styles.empName}>대상: <strong>{selectedEmp}</strong></p>

        <div className={styles.section}>
          <label>유형 선택</label>
          <div className={styles.buttonGroup}>
            {typeOptions.map(opt => (
              <button 
                key={opt.value}
                className={type === opt.value ? styles.active : ''}
                onClick={() => setType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {type === '출근' && (
          <div className={styles.section}>
            <label>시간 선택</label>
            <div className={styles.buttonGroup}>
              {timeOptions.map(t => (
                <button 
                  key={t}
                  className={time === t ? styles.active : ''}
                  onClick={() => setTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <button className={styles.saveBtn} onClick={handleSave}>저장하기</button>
          <button className={styles.closeBtn} onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;