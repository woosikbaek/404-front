import { useState, useEffect, useRef } from 'react';
import styles from './Computation.module.css';
import { getSchedulerClient } from '../../utils/socket';

const Computation = () => {
  const [employeeList, setEmployeeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalData, setModalData] = useState(null); // { emp, type }
  const stompClient = useRef(null);

  // 1. 초기 데이터 가져오기
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
        totalSalary: salaryMap[emp.id] || 0 // 실시간 누적 월급 (Spring에서 온 값)
      }));

      setEmployeeList(combined);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 실시간 소켓 연결
  useEffect(() => {
    fetchData();

    const client = getSchedulerClient();
    client.connect({}, () => {
      client.subscribe('/topic/attendance/admin', (message) => {
        const updateData = JSON.parse(message.body);
        // updateData: { employeeId, newTotalSalary, remainingLeave... }
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

  // 3. 근태 차감 확인 버튼 클릭
  const handleLeaveClick = (emp, type) => {
    setModalData({ emp, type });
  };

  // 4. 모달에서 최종 확인 눌렀을 때
  const confirmLeave = async () => {
    const { emp, type } = modalData;
    try {
      const response = await fetch('/api/admin/attendance/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: emp.id,
          date: new Date().toISOString().split('T')[0],
          status: type // '연차' 또는 '병가'
        })
      });

      if (response.ok) {
        // 성공 시 즉시 로컬 UI 반영
        setEmployeeList(prev => prev.map(e => {
          if (e.id === emp.id) {
            const key = type === '연차' ? 'annual_leave' : 'sick_leave';
            return { ...e, [key]: e[key] - 1 };
          }
          return e;
        }));
        setModalData(null);
      }
    } catch (error) {
      alert("근태 반영 중 오류가 발생했습니다.");
    }
  };

  console.log(employeeList)

  return (
    <div className={styles.container}>
      <div className={styles.dashboardCard}>
        <header className={styles.header}>
          <h2>근태 및 급여 정산 대시보드</h2>
          <button onClick={fetchData} className={styles.refreshBtn}>데이터 새로고침</button>
        </header>

        <div className={styles.tableArea}>
          {isLoading ? (
            <div className={styles.loader}>정보를 동기화하고 있어요... ✨</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>사번</th>
                  <th>성명</th>
                  <th>부서</th>
                  <th>기본급</th>
                  <th>누적월급</th>
                  <th>차감금액</th>
                  <th>근태 관리</th>
                </tr>
              </thead>
              <tbody>
                {employeeList.map((emp) => {
                  const deduction = (emp.monthly_salary || 0) - (emp.totalSalary || 0);
                  
                  return (
                    <tr key={emp.id}>
                      <td className={styles.employeeNumber}>{emp.employeeNumber}</td>
                      <td className={styles.empName}>{emp.name}</td>
                      <td><span className={styles.badge}>{emp.department}</span></td>
                      <td className={styles.baseSalary}>
                        {emp.monthly_salary?.toLocaleString()}원
                      </td>
                      <td className={styles.accumSalary}>
                        {emp.hourly_rate?.toLocaleString()}원
                      </td>
                      <td className={styles.deductionSalary}>
                        {deduction.toLocaleString()}원
                      </td>
                      <td>
                        <button 
                          className={styles.leaveBtn} 
                          onClick={() => handleLeaveClick(emp, '연차')}
                        >
                          연차 {emp.annual_leave}
                        </button>
                        <button 
                          className={styles.sickBtn} 
                          onClick={() => handleLeaveClick(emp, '병가')}
                        >
                          병가 {emp.sick_leave}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.completeBtn} 
            onClick={() => alert('검산이 완료되었습니다.')}
          >
            검산완료
          </button>
        </div>
      </div>

      {/* 확인 모달창 */}
      {modalData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>근태 적용 확인</h3>
            <p className={styles.modalMessage}>
              <strong>{modalData.emp.name}</strong> 님의 <br />
              <span className={styles.highlight}>{modalData.type}</span>를 1회 차감하시겠습니까?
            </p>
            <div className={styles.modalBtns}>
              <button className={styles.confirmBtn} onClick={confirmLeave}>확인</button>
              <button className={styles.cancelBtn} onClick={() => setModalData(null)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Computation;