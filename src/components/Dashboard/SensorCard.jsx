import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';

const COLORS = ['#28a745', '#dc3545'];
const DEVICE_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const SensorCard = ({ stats, onOpenModal }) => {
  const sensorComparisonChartData = [
    { name: '센서 불량 차량', value: stats.sensor.defect_car_count },
    { name: '기타 불량 차량', value: stats.overall.defect_car_count - stats.sensor.defect_car_count }
  ];

  return (
    <div className={`${styles.card} ${styles.sensorCard}`}>
      <div className={`${styles.cardHeader} ${styles.sensorCardHeader}`}>
        <h2>센서 검사</h2>
        <span className={styles.cardSubtitle}>센서 검사 데이터</span>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={sensorComparisonChartData}
                cx="50%" cy="50%"
                innerRadius={40} outerRadius={70}
                paddingAngle={2} dataKey="value"
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
          <div className={styles.statCell}><label>불량 차량</label><div className={`${styles.value} ${styles.error}`}>{stats.sensor.defect_car_count}대</div></div>
          <div className={styles.statCell}><label>불량률</label><div className={`${styles.value} ${styles.error}`}>{stats.sensor.defect_rate}%</div></div>
          <div className={styles.statCell}><label>불량 건수</label><div className={`${styles.value} ${styles.error}`}>{stats.sensor.defect_log_count}건</div></div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>장치별 상세 분석</h3>
            <button className={styles.detailBtn} onClick={onOpenModal}>상세보기 →</button>
          </div>
          <div className={styles.deviceSummaryList}>
            {Object.entries(stats.sensor.by_device).length > 0 ? (
              Object.entries(stats.sensor.by_device).map(([device, info], idx) => (
                <div key={device} className={styles.deviceSummaryItem}>
                  <div className={styles.deviceColor} style={{ backgroundColor: DEVICE_COLORS[idx % DEVICE_COLORS.length] }}></div>
                  <span className={styles.deviceName}>{device}</span>
                  <span className={styles.deviceValue} style={{ float: 'right' }}>{info.defect_log_count}건</span>
                </div>
              ))
            ) : <p className={styles.noData}>불량 데이터 없음 ✓</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SensorCard;