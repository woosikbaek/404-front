import { useState } from 'react'; // useState 추가
import { format } from 'date-fns';
import styles from './ScheduleHeader.module.css';
import Salarys from './Salarys';

const ScheduleHeader = ({ currentMonth, prevMonth, nextMonth, isAdmin, selectedEmp, setSelectedEmp }) => {
  // [수정 포인트 1] 모달 열림 상태 관리
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  return (
    <div className={styles.header}>
      <div className={`${styles.col} ${styles.colEnd}`}>
        <i className="fa-solid fa-angle-left" onClick={prevMonth}></i>
      </div>
      
      <div className={`${styles.col} ${styles.colStart}`}>
        <span className={styles.text}>
          <span className={styles.year}>
            {format(currentMonth, 'yyyy')}
          </span>
          {format(currentMonth, 'M')}월
        </span>

        <div className={`${styles.col} ${styles.colEnd}`}>
          <i className="fa-solid fa-angle-right" onClick={nextMonth}></i>
        </div>

        {/* 관리자일 때만 보여주는 영역 */}
        {isAdmin && (
          <div className={styles.adminControls}>
            <select className={styles.selectUserBtn} value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
              <option value="전체">근무자 선택</option>
              <option value="우시크">우시크</option>
              <option value="수환공주">수환공주</option>
              <option value="연재">연재</option>
              <option value="승택">승택</option>
            </select>
          </div>
        )}

        <div>--</div>

        <div>
          <button 
            className={styles.employeeListBtn} 
            onClick={() => setIsSalaryModalOpen(true)}
          >
            직원 목록
          </button>
        </div>
      </div>

      <Salarys 
        isOpen={isSalaryModalOpen} 
        onClose={() => setIsSalaryModalOpen(false)} 
      />
    </div>
  );
};

export default ScheduleHeader;