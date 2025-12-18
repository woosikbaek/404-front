import { useState } from 'react'
import './App.css'
import PowerToggle from './components/PowerToggle'
import Dashboard from './components/Dashboard'
import DefectLog from './components/DefectLog'

function App() {
  const [isPowerOn, setIsPowerOn] = useState(false)
  const [statsData, setStatsData] = useState(null)

  const handlePowerChange = (newPowerState) => {
    setIsPowerOn(newPowerState)
  }

  const handleStatsUpdate = (data) => {
    setStatsData(data)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">🏭 공정 시스템 관리</h1>
        <p className="app-subtitle">실시간 공정 모니터링 및 불량 검출 시스템</p>
      </header>
      
      <main className="app-main">
        <PowerToggle onPowerChange={handlePowerChange} />
        <Dashboard isPowerOn={isPowerOn} onStatsUpdate={handleStatsUpdate} />
        <DefectLog isPowerOn={isPowerOn} />
      </main>

      <footer className="app-footer">
        <p>© 2025 공정 시스템 관리 | Powered by React</p>
      </footer>
    </div>
  )
}

export default App
