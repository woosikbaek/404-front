import { useState, useEffect, useRef } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { getSchedulerClient } from '../../utils/socket';
import ScheduleHeader from './ScheduleHeader';
import ScheduleDays from './ScheduleDays';
import ScheduleBody from './ScheduleBody';
import styles from './Schedule.module.css';

const Schedule = () => {

  const stompClientRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [empList, setEmpList] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);

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

    fetch('http://192.168.1.78:5000/auth/info/all')
      .then(res => res.json())
      .then(data => {
        setEmpList(data)
        setSelectedEmp(data[0]);
      })
      .catch(err => console.error("사원 정보 로드 실패", err));

    // 2. STOMP 클라이언트 생성 및 연결
    const client = getSchedulerClient();

    client.connect({}, (frame) => {
      console.log('STOMP Connected:', frame);
      stompClientRef.current = client;

      // 스케줄 관련 토픽 구독
      client.subscribe('/topic/attendance', (msg) => {
        const newData = JSON.parse(msg.body);
        setEvents((prev) => {
          const isHaving = prev.find(event => event.id === newData.id);

          if (isHaving) {
            return prev.map(event => event.id === newData.id ? newData : event);
          } else {
            return [...prev, newData];
          }
        });
      });
    }, (error) => {
      console.error('STOMP 연결 에러:', error);
    });

    // 3. 클린업 함수 (언마운트 시 연결 해제)
    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect(() => {
          console.log("STOMP Disconnected");
        });
      }
    };
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
        empList={empList}
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