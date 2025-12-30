import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import SensorDetailModal from './SensorDetailModal';
import Header from './Header';
import styles from './Dashboard.module.css';
import socket from '../utils/socket';

// 원형 차트 색상
const COLORS = ['#28a745', '#dc3545'];
const DEVICE_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

function Dashboard() {
  const [stats, setStats] = useState({
    total_count: 0,
    overall: {
      normal_car_count: 0,
      defect_car_count: 0,
      defect_rate: 0,
      defect_log_count: 0
    },
    sensor: {
      defect_car_count: 0,
      defect_rate: 0,
      defect_log_count: 0,
      by_device: {}
    },
    camera: {
      defect_car_count: 0,
      defect_rate: 0,
      defect_log_count: 0
    }
  });

  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 초기 데이터 받아오기 (REST API)
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://192.168.1.78:5000/dashboard/summary');
        const data = await response.json();
        console.log('초기 데이터:', data);
        setStats(data);
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
        addAlert('❌ 초기 데이터를 불러올 수 없습니다', 'error');
      }
    };

    fetchInitialData();

    // 연결 성공
    const handleConnect = () => {
      console.log('서버 연결됨');
      setConnected(true);
    };

    // 초기 통계 수신
    const handleStats = (data) => {
      console.log('초기 통계 수신:', data);
      setStats(data);
    };

    // 통계 업데이트
    const handleStatsUpdate = (data) => {
      console.log('통계 업데이트:', data);
      setStats(data);
    };

    // 센서 불량
    const handleSensorDefect = (data) => {
      console.log('센서 불량:', data);
      addAlert(`⚠️ 센서 불량 감지: ${data.device}`, 'error');
    };

    // 카메라 불량
    const handleCameraDefect = (data) => {
      console.log('카메라 불량:', data);
      addAlert('⚠️ 외관 불량 감지됨', 'error');
    };

    // 차량 추가
    const handleCarAdded = (data) => {
      console.log('새 차량:', data);
      addAlert('🚗 새 차량 추가됨', 'success');
    };

    // 연결 끊김
    const handleDisconnect = () => {
      console.log('서버 연결 끊김');
      setConnected(false);
    };

    // 에러
    const handleError = (error) => {
      console.error('Socket 에러:', error);
      addAlert('❌ 연결 오류', 'error');
    };

    // 이미 연결되어 있으면 연결 상태 설정
    if (socket.connected) {
      setConnected(true);
    }

    // 이벤트 리스너 등록
    socket.on('connect', handleConnect);
    socket.on('stats', handleStats);
    socket.on('stats_update', handleStatsUpdate);
    socket.on('sensor_defect', handleSensorDefect);
    socket.on('camera_defect', handleCameraDefect);
    socket.on('car_added', handleCarAdded);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    return () => {
      // 이벤트 리스너 제거
      socket.off('connect', handleConnect);
      socket.off('stats', handleStats);
      socket.off('stats_update', handleStatsUpdate);
      socket.off('sensor_defect', handleSensorDefect);
      socket.off('camera_defect', handleCameraDefect);
      socket.off('car_added', handleCarAdded);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
    };
  }, []);

  const addAlert = (message, type) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 5000);
  };

  // 전체 통계 원형 차트 데이터
  const overallChartData = [
    { name: '정상 차량', value: stats.overall.normal_car_count },
    { name: '불량 차량', value: stats.overall.defect_car_count }
  ];

  // 센서 불량 차량 원형 차트 데이터
  const sensorCarChartData = [
    { name: '정상 차량', value: stats.total_count - stats.sensor.defect_car_count },
    { name: '불량 차량', value: stats.sensor.defect_car_count }
  ];

  // 센서 장치별 원형 차트 데이터 (건수)
  const sensorChartData = Object.entries(stats.sensor.by_device)
    .filter(([_, info]) => info.defect_log_count > 0)
    .map(([device, info]) => ({
      name: device,
      value: info.defect_log_count
    }));

  // 센서 장치별 차량 원형 차트 데이터
  const sensorDeviceCarChartData = Object.entries(stats.sensor.by_device)
    .filter(([_, info]) => info.defect_car_count > 0)
    .map(([device, info]) => ({
      name: device,
      value: info.defect_car_count
    }));

  // 외관 불량 차량 원형 차트 데이터
  const cameraCarChartData = [
    { name: '정상 차량', value: stats.total_count - stats.camera.defect_car_count },
    { name: '불량 차량', value: stats.camera.defect_car_count }
  ];

  // 센서 불량 비율 (전체 불량 중 센서 불량)
  const sensorComparisonChartData = [
    { name: '센서 불량 차량', value: stats.sensor.defect_car_count },
    { name: '기타 불량 차량', value: stats.overall.defect_car_count - stats.sensor.defect_car_count }
  ];

  // 외관 불량 비율 (전체 불량 중 외관 불량)
  const cameraComparisonChartData = [
    { name: '외관 불량 차량', value: stats.camera.defect_car_count },
    { name: '기타 불량 차량', value: stats.overall.defect_car_count - stats.camera.defect_car_count }
  ];

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
        {/* 전체 통계 카드 */}
        <div className={`${styles.card} ${styles.summaryCard}`}>
          <div className={`${styles.cardHeader} ${styles.summaryCardHeader}`}>
            <h2>전체 검사 현황</h2>
          </div>
          
          <div className={styles.cardContent}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={overallChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {overallChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}대`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.statGrid}>
              <div className={styles.statBox}>
                <label>총 차량 수</label>
                <div className={`${styles.statValue} ${styles.large}`}>{stats.total_count}</div>
              </div>
              <div className={styles.statBox}>
                <label>정상 차량</label>
                <div className={`${styles.statValue} ${styles.success}`}>{stats.overall.normal_car_count}</div>
              </div>
              <div className={styles.statBox}>
                <label>불량 차량</label>
                <div className={`${styles.statValue} ${styles.error}`}>{stats.overall.defect_car_count}</div>
              </div>
              <div className={styles.statBox}>
                <label>전체 불량률</label>
                <div className={`${styles.statValue} ${styles.error}`}>{stats.overall.defect_rate}%</div>
              </div>
              <div className={styles.statBox}>
                <label>전체 불량 건수</label>
                <div className={`${styles.statValue} ${styles.error}`}>{stats.overall.defect_log_count}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 센서 검사 카드 */}
        <div className={`${styles.card} ${styles.sensorCard}`}>
          <div className={`${styles.cardHeader} ${styles.sensorCardHeader}`}>
            <h2>센서 검사</h2>
            <span className={styles.cardSubtitle}>센서 검사 데이터</span>
          </div>

          <div className={styles.cardContent}>
            {/* 전체 불량 vs 센서 불량 도넛 */}
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={sensorComparisonChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sensorComparisonChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}대`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.statRow}>
              <div className={styles.statCell}>
                <label>불량 차량</label>
                <div className={`${styles.value} ${styles.error}`}>{stats.sensor.defect_car_count}대</div>
              </div>
              <div className={styles.statCell}>
                <label>불량률</label>
                <div className={`${styles.value} ${styles.error}`}>{stats.sensor.defect_rate}%</div>
              </div>
              <div className={styles.statCell}>
                <label>불량 건수</label>
                <div className={`${styles.value} ${styles.error}`}>{stats.sensor.defect_log_count}건</div>
              </div>
            </div>

            {/* 장치별 불량 요약 */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>장치별 상세 분석</h3>
                <button className={styles.detailBtn} onClick={() => setIsModalOpen(true)}>
                  상세보기 →
                </button>
              </div>
              
              <div className={styles.deviceSummaryList}>
                {Object.keys(stats.sensor.by_device).length > 0 ? (
                  Object.entries(stats.sensor.by_device).map(([device, info], idx) => (
                    <div key={device} className={styles.deviceSummaryItem}>
                      <div className={styles.deviceColor} style={{ backgroundColor: DEVICE_COLORS[idx % DEVICE_COLORS.length] }}></div>
                      <span className={styles.deviceName}>{device}</span>
                      <span className={styles.deviceValue} style={{ float: 'right' }}>{info.defect_log_count}건</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>불량 데이터 없음 ✓</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 카메라 검사 카드 */}
        <div className={`${styles.card} ${styles.cameraCard}`}>
          <div className={`${styles.cardHeader} ${styles.cameraCardHeader}`}>
            <h2>외관 검사</h2>
            <span className={styles.cardSubtitle}>카메라 외관 검사 데이터</span>
          </div>

          <div className={styles.cardContent}>
            {/* 전체 불량 vs 외관 불량 도넛 */}
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={cameraComparisonChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {cameraComparisonChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}대`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.statRow}>
              <div className={styles.statCell}>
                <label>불량 차량</label>
                <div className={`${styles.value} ${styles.error}`}>{stats.camera.defect_car_count}대</div>
              </div>
              <div className={styles.statCell}>
                <label>불량률</label>
                <div className={`${styles.value} ${styles.error}`}>{stats.camera.defect_rate}%</div>
              </div>
              <div className={styles.statCell}>
                <label>불량 건수</label>
                <div className={`${styles.value} ${styles.error}`}>{stats.camera.defect_log_count}건</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 센서 상세분석 모달 */}
      <SensorDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sensorData={stats.sensor}
      />
    </div>
  );
}

export default Dashboard;
