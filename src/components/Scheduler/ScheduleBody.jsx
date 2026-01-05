import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import styles from './ScheduleBody.module.css';

const ScheduleBody = ({ currentMonth, selectedDate, onDateClick, isAdmin }) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = '';

  const handleDateClick = (cloneDay) => {
    if (isAdmin) {
      console.log("관리자 모드: 스케줄 수정 창을 엽니다.", format(cloneDay, 'yyyy-MM-dd'));
      // 여기서 관리자용 수정 모달을 띄우는 로직을 추가할 수 있습니다.
    }
    onDateClick(cloneDay);
  };

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, 'd');
      const cloneDay = day;
      const isCurrentMonth = isSameMonth(day, monthStart);
      days.push(
        <div
          className={`${styles.col} ${!isCurrentMonth
              ? styles.disabled
              : isSameDay(day, selectedDate)
                ? styles.selected
                : styles.valid
            }`}
          key={day.toString()} // 문자열 키 권장
          onClick={() => handleDateClick(cloneDay)}
        >
          <span className={!isCurrentMonth ? `${styles.text} ${styles.notValid}` : styles.text}>
            {formattedDate}
          </span>
        </div>,
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className={styles.row} key={day.toString()}>
        {days}
      </div>,
    );
    days = [];
  }
  return <div>{rows}</div>;
}

export default ScheduleBody;