import { useState } from 'react';
import { format } from 'date-fns';
import styles from './ScheduleHeader.module.css';
import Salarys from './Salarys';

const ScheduleHeader = ({ currentMonth, prevMonth, nextMonth, isAdmin, selectedEmp, setSelectedEmp, empList, selectedBranch, setSelectedBranch, selectedRange, setSelectedRange }) => {
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  return (
    <div className={styles.header}>
      <div className={`${styles.col} ${styles.colEnd}`}>
        <i className="fa-solid fa-angle-left" onClick={prevMonth}></i>
      </div>

      <div className={`${styles.col} ${styles.colStart}`}>
        <span className={styles.text}>
          <span className={styles.year}>
            {format(currentMonth, 'yyyy')}
          </span>
          {format(currentMonth, 'M')}월
        </span>

        <div className={`${styles.col} ${styles.colEnd}`}>
          <i className="fa-solid fa-angle-right" onClick={nextMonth}></i>
        </div>

        {/* 관리자일 때만 보여주는 영역 */}
        {isAdmin && (
          <>
          <div className={styles.rangePicker}>
            <input type="date" value={selectedRange.start} onChange={e => {
              setSelectedRange({...selectedRange, start: e.target.value})
            }} />
            <span>~</span>
            <input type="date" value={selectedRange.end} onChange={e => {
              setSelectedRange({...selectedRange, end: e.target.value})
            }} />
          </div>
          </>
        )}
            <div className={styles.branchSelect}>
              <select className={styles.branchBtn} value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                <option value="전체 지점">지역</option>
                <option value="강동">강동</option>
              </select>
            </div>

            {selectedBranch === '강동' && (
              <div className={styles.adminControls}>
                <select className={styles.selectUserBtn} value={selectedEmp ? selectedEmp.id : '선택된 사원 없음'}
                  onChange={(e) => {
                    const selectId = e.target.value;
                    const fullEmp = empList.find(emp => String(emp.id) === String(selectId));
                    setSelectedEmp(fullEmp);
                  }}>
                  {empList.length === 0 && <option value="">로딩중...</option>}
                  {empList.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                <div>
                  <button
                    className={styles.employeeListBtn}
                    onClick={() => setIsSalaryModalOpen(true)}
                  >
                    직원 목록
                  </button>
                </div>
              </div>
            )}
      </div>

      <Salarys
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
      />
    </div>
  );
};

export default ScheduleHeader;