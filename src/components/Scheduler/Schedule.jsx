import { useState, useEffect } from 'react';
import { addMonths, subMonths } from 'date-fns';
import socket from '../../utils/socket';
import ScheduleHeader from './ScheduleHeader';
import ScheduleDays from './ScheduleDays';
import ScheduleBody from './ScheduleBody';
import styles from './Schedule.module.css';

const Schedule = () => {

  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmp, setSelectedEmp] = useState("근무자 선택");

  const [isAdmin, setIsAdmin] = useState(true);

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  const onDateClick = (day) => {
    setSelectedDate(day);
  };

  useEffect(() => {
    fetch('http://192.168.1.78:5000/schedule')
      .then(response => response.json())
      .then(data => setEvents(data))
      .catch(error => console.error('초기 데이터 로드 실패', error));

      const handleUpdateEvent = (updatedEvents) => {
        console.log('이벤트 업데이트', updatedEvents);
        setEvents(updatedEvents);
      };
      socket.on('schedule_update', handleUpdateEvent);
      
      return () => {
        socket.off('schedule_update', handleUpdateEvent);
      }
  }, []);

  const saveSchedule = (newSchedule) => {
    socket.emit('update_schedule', newSchedule);
  };

  return (
    <div className={styles.calendar}>
      <ScheduleHeader
        currentMonth={currentMonth}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
        isAdmin={isAdmin}
        selectedEmp={selectedEmp}
        setSelectedEmp={setSelectedEmp}
      />

      <ScheduleDays />
      
      <ScheduleBody
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        onDateClick={onDateClick}
        isAdmin={isAdmin}
        selectedEmp={selectedEmp}
        events={events}
        saveSchedule={saveSchedule}
      />
    </div>

  )
}

export default Schedule;