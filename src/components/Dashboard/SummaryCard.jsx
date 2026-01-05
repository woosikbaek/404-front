import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';

const COLORS = ['#28a745', '#dc3545'];

const SummaryCard = ({ stats }) => {
  const overallChartData = [
    { name: '정상 차량', value: stats.overall.normal_car_count },
    { name: '불량 차량', value: stats.overall.defect_car_count }
  ];

  return (
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
                cx="50%" cy="50%"
                innerRadius={40} outerRadius={70}
                paddingAngle={2} dataKey="value"
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
          <div className={styles.statBox}><label>총 차량 수</label><div className={`${styles.statValue} ${styles.large}`}>{stats.total_count}</div></div>
          <div className={styles.statBox}><label>정상 차량</label><div className={`${styles.statValue} ${styles.success}`}>{stats.overall.normal_car_count}</div></div>
          <div className={styles.statBox}><label>불량 차량</label><div className={`${styles.statValue} ${styles.error}`}>{stats.overall.defect_car_count}</div></div>
          <div className={styles.statBox}><label>전체 불량률</label><div className={`${styles.statValue} ${styles.error}`}>{stats.overall.defect_rate}%</div></div>
          <div className={styles.statBox}><label>전체 불량 건수</label><div className={`${styles.statValue} ${styles.error}`}>{stats.overall.defect_log_count}</div></div>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;