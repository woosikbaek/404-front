import { useState } from 'react'
import './App.css'
import PowerToggle from './components/PowerToggle'
import Dashboard from './components/Dashboard'
import DefectLog from './components/DefectLog'

function App() {
  const [isPowerOn, setIsPowerOn] = useState(false)
  const [statsData, setStatsData] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handlePowerChange = (newPowerState) => {
    setIsPowerOn(newPowerState)
  }

  const handleStatsUpdate = (data) => {
    setStatsData(data)
  }

  return (
    <div className="app-container">
      
      <main className="app-main">
        <PowerToggle onPowerChange={handlePowerChange} />
        
        {/* 탭 메뉴 */}
        <div className="tab-container">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 대시보드
          </button>
          <button 
            className={`tab-button ${activeTab === 'defectlog' ? 'active' : ''}`}
            onClick={() => setActiveTab('defectlog')}
          >
            📋 불량 로그
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="tab-content">
          {activeTab === 'dashboard' && (
            <Dashboard isPowerOn={isPowerOn} onStatsUpdate={handleStatsUpdate} />
          )}
          {activeTab === 'defectlog' && (
            <DefectLog isPowerOn={isPowerOn} />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2025 공정 시스템 관리 | Powered by React</p>
      </footer>
    </div>
  )
}

export default App
