import { useState, useEffect } from 'react';
import styles from './Salarys.module.css';

const Salarys = ({ isOpen, onClose }) => {
  const [salarysList, setSalarysList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, salaryRes] = await Promise.all([
        fetch('/auth/info/all'),
        fetch('/api/admin/attendance/salary/all-summary')
      ]);

      const empData = await empRes.json();
      const salaryMap = await salaryRes.json(); // 원본: {5: 120000, 6: 0, ...}

      console.log("직원 데이터:", empData);
      console.log("급여 데이터(Map):", salaryMap);

      // 데이터 매칭 로직 수정
      const combined = empData.map(emp => {
        // salaryMap에서 emp.id를 키(key)로 사용하여 급여를 바로 가져옵니다.
        // 데이터가 없을 경우를 대비해 0으로 처리합니다.
        const totalSalary = salaryMap[emp.id] || 0;

        return {
          ...emp,
          totalSalary: totalSalary
        };
      });

      setSalarysList(combined);
    } catch (error) {
      console.error("통신 에러 상세:", error);
      alert("데이터를 매칭하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null; // 모달이 닫혀있으면 아무것도 렌더링하지 않음

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>전직원 급여 일람표</h2>
          <button className={styles.closeX} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tableArea}>
          {isLoading ? (
            <div className={styles.loader}>데이터를 매칭하는 중입니다...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>사번</th>
                  <th>이름</th>
                  <th>부서</th>
                  <th>직급</th>
                  <th>연차</th>
                  <th>병가</th>
                  <th>전화번호</th>
                  <th>총 급여 (원)</th>
                  <th>기본 급여 (원)</th>
                </tr>
              </thead>
              <tbody>
                {salarysList.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.employeeNumber}</td>
                    <td className={styles.empName}>{emp.name}</td>
                    <td>{emp.department || '미지정'}</td>
                    <td>{emp.position}</td>
                    <td>{emp.annual_leave || 0}</td>
                    <td>{emp.sick_leave || 0}</td>
                    <td>{emp.phone || '미지정'}</td>
                    <td className={styles.salaryAmount}>
                      {emp.totalSalary?.toLocaleString()}
                    </td>
                    <td className={styles.salaryAmount}>
                      {emp.monthly_salary?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Salarys;