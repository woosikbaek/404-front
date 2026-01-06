import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import Manager from './manager';
import { useState } from 'react';
import styles from './ScheduleBody.module.css';

const ScheduleBody = ({ currentMonth, selectedDate, onDateClick, isAdmin, selectedEmp, events, saveSchedule }) => {

  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;

  const handleDateClick = (cloneDay) => {
    if (isAdmin) {
      console.log("관리자 모드: 스케줄 수정 창을 엽니다.", format(cloneDay, 'yyyy-MM-dd'));
      // 여기서 관리자용 수정 모달을 띄우는 로직을 추가할 수 있습니다.
      setClickedDate(cloneDay);
      setIsManagerOpen(true);
    }
    onDateClick(cloneDay);
  };

  while (day <= endDate) {
    const rowKey = day.getTime();
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const formattedDate = format(day, 'd');
      const dateStr = format(day, 'yyyy-MM-dd');
      const isCurrentMonth = isSameMonth(day, monthStart);
      const dayEvents = events.filter(event => {
        const isSameDate = event.date === dateStr;
        const isSelectedPerson = (!selectedEmp || selectedEmp === '근무자 선택') ? true : event.name === selectedEmp;
        return isSameDate && isSelectedPerson;
      });
      days.push(
        <div
          className={`${styles.col} ${!isCurrentMonth
            ? styles.disabled
            : isSameDay(day, selectedDate)
              ? styles.selected
              : styles.valid
            }`}
          key={day.toString()}
          onClick={() => handleDateClick(cloneDay)}
        >
          <span className={!isCurrentMonth ? `${styles.text} ${styles.notValid}` : styles.text}>
            {formattedDate}
          </span>

          <div className={styles.eventList}>
            {isCurrentMonth && dayEvents.map((event, idx) => (
              <div key={idx} className={`${styles.eventItem} ${styles[event.status]}`}>
                <span className={styles.empName}>{event.name}</span>
                <span className={styles.empStatus}>
                  {event.type === '출근' ? `${event.time}출` : event.type}
                </span>
              </div>
            ))}
          </div>
        </div>,
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className={styles.row} key={rowKey}>
        {days}
      </div>,
    );
    days = [];
  }
  return <div>
    {rows}
    {isManagerOpen && 
    <Manager date={selectedDate} 
    selectedEmp={selectedEmp}
    onClose={() => setIsManagerOpen(false)} 
    onSave={(data) => {
      saveSchedule(data)
      setIsManagerOpen=(false);
    }}
    />}
  </div>;
};

export default ScheduleBody;