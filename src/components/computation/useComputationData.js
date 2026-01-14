import { useState, useEffect, useRef } from 'react';
import { getSchedulerClient } from '../../utils/socket';

export const useComputationData = () => {
  const [employeeList, setEmployeeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const stompClient = useRef(null);

  // 초기 데이터 가져오기
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, salaryRes] = await Promise.all([
        fetch('/auth/info/all'),
        fetch('/api/admin/attendance/salary/all-summary')
      ]);

      const empData = await empRes.json();
      const salaryMap = await salaryRes.json();

      const combined = empData.map(emp => ({
        ...emp,
        totalSalary: salaryMap[emp.id] || 0
      }));

      setEmployeeList(combined);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 실시간 소켓 연결
  useEffect(() => {
    fetchData();

    const client = getSchedulerClient();
    client.connect({}, () => {
      client.subscribe('/topic/attendance/admin', (message) => {
        const updateData = JSON.parse(message.body);
        setEmployeeList(prev => prev.map(emp =>
          emp.id === updateData.employeeId
            ? {
              ...emp,
              totalSalary: updateData.newTotalSalary,
              annual_leave: updateData.remainingLeave !== undefined ? updateData.remainingLeave : emp.annual_leave
            }
            : emp
        ));
      });
    }, (err) => console.error("STOMP Error:", err));

    stompClient.current = client;

    return () => {
      if (stompClient.current?.connected) stompClient.current.disconnect();
    };
  }, []);

  // 스케줄 차감
  const updateLeave = async (emp, type) => {
    try {
      const response = await fetch('/api/admin/attendance/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp.id,
          date: new Date().toISOString().split('T')[0],
          status: type
        })
      });

      if (response.ok) {
        setEmployeeList(prev => prev.map(e => {
          if (e.id === emp.id) {
            const key = type === '연차' ? 'annual_leave' : 'sick_leave';
            return { ...e, [key]: e[key] - 1 };
          }
          return e;
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("스케줄 업데이트 실패:", error);
      return false;
    }
  };

  return {
    employeeList,
    isLoading,
    fetchData,
    updateLeave
  };
};
