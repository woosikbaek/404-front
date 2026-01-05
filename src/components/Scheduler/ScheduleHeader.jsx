import { format } from 'date-fns';
import styles from './ScheduleHeader.module.css';

const ScheduleHeader = ({ currentMonth, prevMonth, nextMonth, isAdmin }) => {
  return (
    <div className={styles.header}>
      <div className={`${styles.col} ${styles.colStart}`}>
        <span className={styles.text}>
          <span className={styles.month}>
            {format(currentMonth, 'M')}월
          </span>
          {format(currentMonth, 'yyyy')}
        </span>

        {/* 관리자일 때만 보여주는 영역 */}
        {isAdmin && (
          <div className={styles.adminControls}>
            <button className={styles.aditScheduleBtn}>전체 스케줄 수정</button>
            <select className={styles.selectUserBtn}>
              <option>사용자 선택</option>
              <option>직원 A</option>
              <option>직원 B</option>
            </select>
          </div>
        )}
      </div>
        
      <div className={`${styles.col} ${styles.colEnd}`}>
        <i className="fa-solid fa-arrow-left"  onClick={prevMonth}></i>
        <i className="fa-solid fa-arrow-right" onClick={nextMonth}></i>
      </div>
    </div>
  );
};

export default ScheduleHeader;  