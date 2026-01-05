import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';

const COLORS = ['#28a745', '#dc3545'];

const CameraCard = ({ stats }) => {
  const cameraComparisonChartData = [
    { name: '외관 불량 차량', value: stats.camera.defect_car_count },
    { name: '기타 불량 차량', value: stats.overall.defect_car_count - stats.camera.defect_car_count }
  ];

  return (
    <div className={`${styles.card} ${styles.cameraCard}`}>
      <div className={`${styles.cardHeader} ${styles.cameraCardHeader}`}>
        <h2>외관 검사</h2>
        <span className={styles.cardSubtitle}>카메라 외관 검사 데이터</span>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={cameraComparisonChartData}
                cx="50%" cy="50%"
                innerRadius={40} outerRadius={70}
                paddingAngle={2} dataKey="value"
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
          <div className={styles.statCell}><label>불량 차량</label><div className={`${styles.value} ${styles.error}`}>{stats.camera.defect_car_count}대</div></div>
          <div className={styles.statCell}><label>불량률</label><div className={`${styles.value} ${styles.error}`}>{stats.camera.defect_rate}%</div></div>
          <div className={styles.statCell}><label>불량 건수</label><div className={`${styles.value} ${styles.error}`}>{stats.camera.defect_log_count}건</div></div>
        </div>
      </div>
    </div>
  );
}

export default CameraCard;