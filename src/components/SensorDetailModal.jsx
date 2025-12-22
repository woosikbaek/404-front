import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './SensorDetailModal.css';

const DEVICE_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

function SensorDetailModal({ isOpen, onClose, sensorData }) {
  if (!isOpen) return null;

  const sensorChartData = Object.entries(sensorData.by_device || {})
    .filter(([_, info]) => info.defect_log_count > 0)
    .map(([device, info]) => ({
      name: device,
      value: info.defect_log_count
    }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>센서 장치별 상세 분석</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* 차트 영역 */}
          {sensorChartData.length > 0 && (
            <div className="chart-section">
              <h3>장치별 불량 건수</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sensorChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `${value}건`} />
                  <Bar 
                    dataKey="value" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  >
                    {sensorChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 장치별 상세 목록 */}
          <div className="device-detail-section">
            <h3>장치별 상세 정보</h3>
            <div className="device-detail-list">
              {Object.keys(sensorData.by_device || {}).length > 0 ? (
                Object.entries(sensorData.by_device).map(([device, info], idx) => (
                  <div key={device} className="device-detail-item">
                    <div className="device-detail-header">
                      <div className="device-color" style={{ backgroundColor: DEVICE_COLORS[idx % DEVICE_COLORS.length] }}></div>
                      <span className="device-name">{device}</span>
                    </div>
                    <div className="device-detail-stats">
                      <div className="detail-stat-card">
                        <span className="detail-label">차량 불량 수</span>
                        <span className="detail-value error">{info.defect_car_count}대</span>
                      </div>
                      <div className="detail-stat-card">
                        <span className="detail-label">차량 불량률</span>
                        <span className="detail-value error">{info.car_defect_rate}%</span>
                      </div>
                      <div className="detail-stat-card">
                        <span className="detail-label">불량 건수</span>
                        <span className="detail-value warning">{info.defect_log_count}건</span>
                      </div>
                      <div className="detail-stat-card">
                        <span className="detail-label">건수 비율</span>
                        <span className="detail-value warning">{info.log_defect_rate}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">불량 데이터 없음 ✓</p>
              )}
            </div>
          </div>

          {/* 요약 통계 */}
          <div className="summary-section">
            <h3>전체 센서 검사 요약</h3>
            <div className="summary-grid">
              <div className="summary-card">
                <span className="summary-label">총 불량 차량</span>
                <span className="summary-value error">{sensorData.defect_car_count || 0}대</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">총 불량 건수</span>
                <span className="summary-value error">{sensorData.defect_log_count || 0}건</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">불량률</span>
                <span className="summary-value error">{sensorData.defect_rate || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-close" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

export default SensorDetailModal;
