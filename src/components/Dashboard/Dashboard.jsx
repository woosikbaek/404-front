import { useEffect, useState } from 'react';
import SensorDetailModal from './SensorDetailModal';
import Header from '../Header';
import SummaryCard from './SummaryCard';
import SensorCard from './SensorCard';
import CameraCard from './CameraCard';
import styles from './Dashboard.module.css';
import socket from '../../utils/socket';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_count: 0,
    overall: { normal_car_count: 0, defect_car_count: 0, defect_rate: 0, defect_log_count: 0 },
    sensor: { defect_car_count: 0, defect_rate: 0, defect_log_count: 0, by_device: {} },
    camera: { defect_car_count: 0, defect_rate: 0, defect_log_count: 0 }
  });

  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addAlert = (message, type) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://192.168.1.78:5000/dashboard/summary');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
        addAlert('❌ 초기 데이터를 불러올 수 없습니다', 'error');
      }
    };

    fetchInitialData();

    // 소켓 이벤트 등록
    socket.on('connect', () => setConnected(true));
    socket.on('stats_update', (data) => setStats(data));
    socket.on('sensor_defect', (data) => addAlert(`⚠️ 센서 불량 감지: ${data.device}`, 'error'));
    socket.on('camera_defect', () => addAlert('⚠️ 외관 불량 감지됨', 'error'));
    socket.on('car_added', () => addAlert('🚗 새 차량 추가됨', 'success'));
    socket.on('disconnect', () => setConnected(false));
    socket.on('error', (error) => {
      console.error('Socket 에러:', error);
      addAlert('❌ 연결 오류', 'error');
    });

    if (socket.connected) {
      setConnected(true);
    }

    return () => socket.removeAllListeners();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <Header connected={connected} />
      
      <div className={styles.alertsContainer}>
        {alerts.map(alert => (
          <div key={alert.id} className={`${styles.alert} ${alert.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
            {alert.message}
          </div>
        ))}
      </div>

      <div className={styles.dashboard}>
        <SummaryCard stats={stats} />
        <SensorCard stats={stats} onOpenModal={() => setIsModalOpen(true)} />
        <CameraCard stats={stats} />
      </div>

      <SensorDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sensorData={stats.sensor}
      />
    </div>
  );
}

export default Dashboard;