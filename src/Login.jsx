import { useState } from "react";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 로그인 요청
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employeeNumber: employeeNumber, 
          password: password 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // 서버에서 반환한 에러 메시지 사용
        throw new Error(data.message || data.error || '로그인 실패');
      }

      const { access_token, refresh_token } = data;

      // 토큰 저장
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('name', data.employee.name);

      // 로그인 성공 콜백
      onLoginSuccess();
    } catch (err) {
      setError('서버 응답 없음' || '사원번호 또는 비밀번호가 올바르지 않습니다.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>공정 시스템 로그인</h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="employeeNumber">사원번호</label>
            <input 
              type="text" 
              id="employeeNumber"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="사원번호를 입력하세요"
              disabled={isLoading}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;