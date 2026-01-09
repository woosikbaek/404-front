import { useState } from 'react';
import styles from './Computation.module.css';
import ComputationHeader from './ComputationHeader';
import ComputationTable from './ComputationTable';
import ComputationFooter from './ComputationFooter';
import LeaveConfirmModal from './LeaveConfirmModal';
import { useComputationData } from './useComputationData';

const Computation = () => {
  const [modalData, setModalData] = useState(null);
  const { employeeList, isLoading, fetchData, updateLeave } = useComputationData();

  const handleLeaveClick = (emp, type) => {
    setModalData({ emp, type });
  };

  const confirmLeave = async () => {
    const { emp, type } = modalData;
    const success = await updateLeave(emp, type);
    
    if (success) {
      setModalData(null);
    } else {
      alert("스케줄 반영 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.dashboardCard}>
        <ComputationHeader onRefresh={fetchData} />
        
        <div className={styles.tableArea}>
          <ComputationTable 
            employeeList={employeeList} 
            isLoading={isLoading}
            onLeaveClick={handleLeaveClick}
          />
        </div>

        <ComputationFooter />
      </div>

      <LeaveConfirmModal 
        modalData={modalData}
        onConfirm={confirmLeave}
        onCancel={() => setModalData(null)}
      />
    </div>
  );
};

export default Computation;