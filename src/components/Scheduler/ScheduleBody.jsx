import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, getDay } from 'date-fns';
import Manager from './manager';
import { useState } from 'react';
import styles from './ScheduleBody.module.css';

const ScheduleBody = ({ currentMonth, selectedDate, onDateClick, isAdmin, selectedEmp, events, saveSchedule, holidays = [] }) => {

  const STATUS_COLORS = {
    '출근': styles.work,
    '퇴근': styles.leave,
    '지각': styles.late,
    '휴가': styles.vacation,
    '반차': styles.half,
    '결근': styles.absent,
    '연차': styles.annual,
    '병가': styles.sick,
  };
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

      const isSunday = getDay(day) === 0;
      const isSaturday = getDay(day) === 6;


      const holiday = holidays.find(h => h.date === dateStr);
      const isHoliday = !!holiday;

      const dayEvents = events.filter(event => event.workDate === dateStr);
      
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
          {/* 빨간 날 표시 */}
          <span className={` 
            ${!isCurrentMonth ? `${styles.text} ${styles.notValid}` : styles.text}
            ${isCurrentMonth && (isSunday || isHoliday) ? styles.sunday : ''} 
            ${isCurrentMonth && isSaturday && !isHoliday ? styles.saturday : ''}`}
          >
            {formattedDate}
          </span>


            {/* 공휴일 표시 */}
          {isCurrentMonth && isHoliday && holiday &&
            <div className={styles.holidayLabel}>
              {holiday.label}
            </div>}

          <div className={styles.eventList}>
            {isCurrentMonth && dayEvents.map((event, idx) => {
              const status = event.status || '결근';
              let statusText = '';

              if (status.includes('병가')) {
                statusText = STATUS_COLORS['병가'];
              } else if (status.includes('결근')) {
                statusText = STATUS_COLORS['결근'];
              } else if (status.includes('정상근무')) {
                statusText = STATUS_COLORS['출근'];
              } else if (status.includes('미퇴근')) {
                statusText = STATUS_COLORS['결근'];
              } else if (status.includes('지각/퇴근')) {
                statusText = STATUS_COLORS['지각'];
              } else {
                statusText = STATUS_COLORS[status] || '';
              }

              return (
                <div key={`${event.employeeId}-${idx}`} className={`${styles.eventItem} ${statusText}`}>
                  <span className={styles.empName}>{event.name}</span>
                  <span className={styles.empStatus}>
                    {status}
                  </span>
                </div>
              );
            })}
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
      <Manager
        date={clickedDate}
        selectedEmp={selectedEmp}
        onClose={() => setIsManagerOpen(false)}
        onSave={(data) => {
          saveSchedule(data)
          setIsManagerOpen(false);
        }}
      />}
  </div>;
};

export default ScheduleBody;