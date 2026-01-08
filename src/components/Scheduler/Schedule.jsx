import { useState, useEffect, useRef } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { getSchedulerClient } from '../../utils/socket';
import { HOLIDAYS } from './holidays';
import ScheduleHeader from './ScheduleHeader';
import ScheduleDays from './ScheduleDays';
import ScheduleBody from './ScheduleBody';
import styles from './Schedule.module.css';

const Schedule = () => {

  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
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
  // 공휴일 데이터 로드
  useEffect(() => {
    const year = format(currentMonth, 'yyyy');
    
    // API로부터 공휴일 데이터 가져오기
    HOLIDAYS(year).then(data => {
      setHolidays(data);
    });
  }, [currentMonth.getFullYear()]); // 연도가 바뀔 때만 호출

  // 1, 초기 데이터 로드
  useEffect(() => {
    fetch('http://192.168.1.78:5000/auth/info/all')
      .then(res => res.json())
      .then(data => {
        const AllEmpList = [{ id: 'all', name: '전체' }, ...data];
        setEmpList(AllEmpList)
        setSelectedEmp(AllEmpList[0]);
      })
      .catch(err => console.error("사원 정보 로드 실패", err));

    // 2. STOMP 클라이언트 생성 및 연결
    const client = getSchedulerClient();
    client.connect({}, () => {
      stompClientRef.current = client;
    });
    return () => { if (stompClientRef.current?.connected) stompClientRef.current.disconnect(); };
  }, []);

  // 특정 사원, 날짜 변경 시 데이터 로드
  useEffect(() => {
    if (!selectedEmp || !stompClientRef.current) return;

    const year = format(currentMonth, 'yyyy');
    const month = format(currentMonth, 'M');
    let fetchUrl = '';
    let topicUrl = '';

    // 모드 판별 (전체 사원 vs 개별 사원)
    if (selectedEmp.id === 'all') {
      fetchUrl = `/api/admin/attendance/monthly/all?year=${year}&month=${month}`;
      topicUrl = '/topic/attendance/admin';
    } else {
      fetchUrl = `/api/admin/attendance/monthly/${selectedEmp.id}?year=${year}&month=${month}`;
      topicUrl = `/topic/attendance/${selectedEmp.id}`;
    }
    // [API 요청]
    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        if (selectedEmp.id === 'all') {
          // 전체 데이터의 경우 logs를 평탄화하고 name 정보를 매칭하여 저장
          const flattened = data.flatMap(item =>
            item.logs.map(log => ({
              ...log,
              employeeId: item.employeeId,
              // empList에서 이름을 찾아 추가 (화면 표시용)
              name: empList.find(e => e.id === item.employeeId)?.name || '알 수 없음'
            }))
          );
          setEvents(flattened);
        } else {
          const rowLogs = Array.isArray(data) ? data : (data.monthlyLogs || []);
          const withName = rowLogs.map(log => ({
            ...log, 
            name: selectedEmp.name,
            employeeId: selectedEmp.id,
          }));
          setEvents(withName);
        }
      });

    // [웹소켓 구독 갱신]
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe();

    if (stompClientRef.current.connected) {
      subscriptionRef.current = stompClientRef.current.subscribe(topicUrl, (msg) => {
        const response = JSON.parse(msg.body);
        const { employeeId, monthlyLogs } = response;
        
        if (!monthlyLogs) {
          return;
        }
        
        // 실시간 데이터 업데이트 (날짜와 사원ID 기준)
        setEvents(prev => {
          // 2. 기존 이벤트 중 해당 사원의 데이터만 정확히 필터링 (제거)
          const filteredPrev = prev.filter(e => String(e.employeeId) !== String(employeeId));
          
          // 3. 해당 사원의 이름 찾기 (사원 리스트에서 검색)
          const targetEmp = empList.find(e => String(e.id) === String(employeeId));
          const empName = targetEmp?.name || '알 수 없음';
          // 4. 서버가 준 새 리스트에 이름과 ID를 입혀서 기존 데이터와 합치기
          const updatedList = monthlyLogs.map(log => ({
            ...log,
            employeeId: employeeId,
            name: empName
          }));
          
          return [...filteredPrev, ...updatedList];
        });
      });
    }
  }, [selectedEmp, currentMonth, empList]);
  
  const saveSchedule = (payload) => {
    const isDelete = payload.status === '';
    const targetUrl = isDelete
    ? '/api/admin/attendance/delete'
    : '/api/admin/attendance/update';
    
    fetch(targetUrl, {
      method: isDelete ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: Number(payload.employeeId),
        date: payload.date,
        status: payload.status
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.message || `요청 실패: ${res.status}`);
        }
      })
      .catch(err => alert("작업에 실패했습니다. CORS 또는 서버 상태를 확인하세요."));
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
        holidays={holidays}
      />
    </div>

  )
}

export default Schedule;