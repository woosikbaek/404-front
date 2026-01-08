import { useState, useEffect } from 'react'
import './App.css'
import Login from './Login'
import PowerToggle from './components/PowerToggle'
import Dashboard from './components/Dashboard/Dashboard'
import DefectLog from './components/DefectLog'
import Progress from './components/Progress'
import Schedule from './components/Scheduler/Schedule'
import Chat from './components/Chat'
import Computation from './components/computation/Computation'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isPowerOn, setIsPowerOn] = useState(false)
  const [statsData, setStatsData] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAuth, setIsAuth] = useState(false) // 전산 시스템 인증 state

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  const handleTabChange = (tab) => {
    if (tab === 'computation') {
      if (isAuth) {
        setActiveTab(tab);
        return;
      }

      const password = prompt('관리자 비밀번호를 입력하세요.');
      if (password === '1234') {
        setIsAuth(true); // 인증 성공 저장
        setActiveTab(tab);
      } else if (password !== null) {
        alert('비밀번호가 틀렸습니다.');
      }
      return; 
    }
    
    setActiveTab(tab);
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

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
        
        <div className="tab-container">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
             대시보드
          </button>
          <button 
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => handleTabChange('progress')}
          >
            진행도 현황
          </button>
          <button 
            className={`tab-button ${activeTab === 'defectlog' ? 'active' : ''}`}
            onClick={() => handleTabChange('defectlog')}
          >
            불량 로그
          </button>
          <button 
            className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => handleTabChange('schedule')}
          >
            스케쥴 확인
          </button>
          <button
           className={`tab-button ${activeTab === 'computation' ? 'active' : ''}`}
            onClick={() => handleTabChange('computation')}
          >
            전산 시스템
          </button>
        </div>

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
          {/* 전산 시스템: 인증된 경우에만 렌더링 (이중 보안) */}
          {activeTab === 'computation' && isAuth && (
            <Computation />
          )}
        </div>
        
        <div>
          <Chat />
        </div>
      </main>
    </div>
  )
}

export default App