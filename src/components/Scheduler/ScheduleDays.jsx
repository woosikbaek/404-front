import styles from './ScheduleDays.module.css';

const ScheduleDays = () => {
  const days = [];
  const date = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    days.push(
      <div className={styles.col} key={i}>
        {date[i]}
      </div>,
    );
  }

  return <div className={`${styles.days}`}>{days}</div>;
}

export default ScheduleDays;