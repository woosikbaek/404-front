import styles from './ComputationTable.module.css';

const ComputationTable = ({ employeeList, isLoading, onLeaveClick }) => {
  if (isLoading) {
    return (
      <div className={styles.loader}>
        <p className={styles.loadingText}>정보 불러오는중...</p>
      </div>
    );
  }


  console.log(employeeList);
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>사번</th>
          <th>성명</th>
          <th>부서</th>
          <th>기본급</th>
          <th>누적월급</th>
          <th>차감금액</th>
          <th>스케줄 관리</th>
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
                {emp.totalSalary?.toLocaleString()}원
              </td>
              <td className={styles.deductionSalary}>
                {deduction.toLocaleString()}원
              </td>
              <td>
                <button
                  className={styles.leaveBtn}
                  onClick={() => onLeaveClick(emp, '연차')}
                >
                  연차 {emp.annual_leave}
                </button>
                <button
                  className={styles.sickBtn}
                  onClick={() => onLeaveClick(emp, '병가')}
                >
                  병가 {emp.sick_leave}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ComputationTable;
