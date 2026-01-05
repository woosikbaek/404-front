import { useState, useEffect } from 'react'
import './App.css'
import Login from './Login'
import PowerToggle from './components/PowerToggle'
import Dashboard from './components/Dashboard/Dashboard'
import DefectLog from './components/DefectLog'
import Progress from './components/Progress'
import Schedule from './components/Scheduler/Schedule'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isPowerOn, setIsPowerOn] = useState(false)
  const [statsData, setStatsData] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  // const handleLogout = () => {
  //   localStorage.removeItem('access_token')
  //   localStorage.removeItem('refresh_token')
  //   setIsLoggedIn(false)
  // }

  // 로그인하지 않은 경우 Login 컴포넌트만 표시
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  const handlePowerChange = (newPowerState) => {
    setIsPowerOn(newPowerState)
  }

  const handleStatsUpdate = (data) => {
    setStatsData(data)
  }

  // 로그인된 경우 메인 앱 표시
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
             대시보드
          </button>
          <button 
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            진행도 현황
          </button>
          <button 
            className={`tab-button ${activeTab === 'defectlog' ? 'active' : ''}`}
            onClick={() => setActiveTab('defectlog')}
          >
            불량 로그
          </button>
          <button 
            className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            스케쥴 확인
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
          {activeTab === 'progress' && (
            <Progress />
          )}
          {activeTab === 'schedule' && (
            <Schedule />
          )}
        </div>
      </main>

      {/* <footer className="app-footer">
        <p>© 2025 공정 시스템 관리 | Powered by React</p>
      </footer> */}
    </div>
  )
}

export default App
