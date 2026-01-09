# 자동차 검사 실시간 대시보드 시스템

자동차 검사 공정의 실시간 모니터링 및 불량 관리를 위한 웹 애플리케이션입니다. WebSocket을 통한 실시간 데이터 수신, Redux를 활용한 전역 상태 관리, 그리고 직관적인 UI를 제공합니다.

## 📋 목차

- [기술 스택](#기술-스택)
- [주요 기능](#주요-기능)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [환경 설정](#환경-설정)
- [주요 컴포넌트](#주요-컴포넌트)
- [상태 관리](#상태-관리)
- [WebSocket 이벤트](#websocket-이벤트)

## 🛠 기술 스택

### Frontend
- **React 19.2.0** - UI 라이브러리
- **Redux Toolkit 2.11.2** - 전역 상태 관리
- **React-Redux 9.2.0** - React-Redux 연동
- **Socket.io-client 4.8.1** - WebSocket 실시간 통신
- **Stompjs & Sockjs-client** - 스케줄 데이터 실시간 통신 (STOMP)
- **Date-fns 4.1.0** - 날짜 계산 및 포맷팅 라이브러리
- **Recharts 3.6.0** - 데이터 시각화 (차트)
- **Vite** - 빌드 도구 및 개발 서버

### 스타일링
- **CSS Modules** - 컴포넌트별 스타일 격리
- **CSS Variables** - 전역 디자인 토큰 관리

## ✨ 주요 기능

### 1. 로그인 시스템
- 사원번호 및 비밀번호 기반 인증
- JWT 토큰 기반 인증 (access_token, refresh_token)
- 로그인 상태 유지 (localStorage)

### 2. 대시보드
- **전체 검사 현황**
  - 총 차량 수, 정상/불량 차량 수
  - 전체 불량률 및 불량 건수
  - 원형 차트로 시각화
- **센서 검사 통계**
  - 센서 불량 차량 수 및 불량률
  - 장치별 상세 분석 (LED, BUZZER, ULTRASONIC 등)
  - 센서 상세 분석 모달
- **외관 검사 통계**
  - 외관 불량 차량 수 및 불량률
  - 카메라 검사 데이터 시각화
- **실시간 알림**
  - 센서/외관 불량 감지 시 알림 표시
  - 새 차량 추가 알림

### 3. 진행도 현황
- **공정 단계 시각화**
  - START → 센서 확인 → 케이스 확인 → 드라이브 확인 → END
  - 각 단계별 상태 표시 (대기/완료/오류)
  - 현재 진행 중인 차량 ID 표시
- **실시간 상태 업데이트**
  - WebSocket을 통한 공정 진행 상태 실시간 수신
  - 불량 발생 시 해당 단계 즉시 빨간색 표시
  - 탭 이동 후에도 상태 유지 (Redux)

### 4. 불량 로그
- **외관 불량 로그**
  - 이미지 미리보기 (최대 2장)
  - 차량번호, 유형, 결과, 날짜 정보
  - 이미지 상세 모달
- **센서 불량 로그**
  - LED, BUZZER, ULTRASONIC 등 센서별 불량 로그
  - 차량번호, 유형, 결과, 날짜 정보
- **페이지네이션**
  - 페이지당 8개 항목 표시
  - 10페이지 단위 그룹 표시
- **실시간 업데이트**
  - WebSocket을 통한 불량 로그 실시간 추가
  - 불량 발생 시 공정 단계와 연동

### 5. 전원 제어
- 공정 시스템 전원 ON/OFF 제어
- 전원 상태 시각적 표시
- 백엔드 API 연동

### 6. 스케줄러
- **실시간 스케줄 모니터링**
  - WebSocket(STOMP) 기반의 실시간 스케줄 상태 수신
  - 사원별/지점별 필터링을 통한 맞춤형 스케줄 조회
- **스마트 캘린더**
  - 공공데이터포털 API 연동을 통한 공휴일 자동 표시 및 라벨링
  - 주말 및 공휴일 시각적 구분 (일요일/공휴일 빨간색, 토요일 파란색)
- **관리자 전용 스케줄 수정**
  - 단일 수정: 특정 날짜 클릭 시 해당 사원의 스케줄 상태 수정/삭제
  - 기간 수정 (Range): 시작일과 종료일을 선택하여 일괄 스케줄 설정
  - 자동 검증: 종료일이 시작일보다 빠를 수 없도록 입력 제한 및 알림

## 📁 프로젝트 구조

```
404-front/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/            # React 컴포넌트
│   │   ├── computation/       # 연산/계산 관련 컴포넌트
│   │   │   ├── ComputationHeader.jsx
│   │   │   ├── ComputationTable.jsx
│   │   │   ├── LeaveConfirmModal.jsx
│   │   │   └── useComputationData.js
│   │   ├── Dashboard/         # 대시보드 메인 컴포넌트 그룹
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SensorDetailModal.jsx
│   │   │   └── *.jsx (Cards)
│   │   ├── Scheduler/         # 스케줄 관리 스케줄러 컴포넌트
│   │   │   ├── Schedule.jsx
│   │   │   ├── ScheduleHeader.jsx
│   │   │   ├── ScheduleBody.jsx
│   │   │   ├── Manager.jsx
│   │   │   ├── Salarys.jsx
│   │   │   └── holidays.js
│   │   ├── Chat.jsx           # 실시간 채팅 컴포넌트
│   │   ├── DefectLog.jsx      # 불량 로그 컴포넌트
│   │   ├── Progress.jsx       # 진행도 현황 컴포넌트
│   │   ├── Header.jsx         # 헤더 컴포넌트
│   │   └── *.module.css       # 컴포넌트별 스타일
│   ├── store/                 # Redux 상태 관리
│   │   ├── store.js           # Redux store 설정
│   │   ├── hooks.js           # Redux hooks
│   │   └── slices/
│   │       └── processStatusSlice.js  # 공정 상태 slice
│   ├── utils/
│   │   └── socket.js          # Socket.io 및 STOMP 클라이언트 설정
│   ├── App.jsx                # 메인 앱 컴포넌트
│   ├── Login.jsx              # 로그인 컴포넌트
│   ├── main.jsx               # 앱 진입점
│   ├── variables.css          # 전역 CSS 변수
│   ├── index.css              # 전역 스타일
│   └── App.css                # 앱 스타일
├── package.json
├── vite.config.js
└── README.md
```

### 설치
```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

## ⚙️ 환경 설정

```env
# API 서버 주소
VITE_API_BASE_URL=[http://192.168.1.78:5000](http://192.168.1.78:5000)

# WebSocket 주소
VITE_WS_CHAT_URL=[http://192.168.1.78:8080/ws-chat](http://192.168.1.78:8080/ws-chat)
VITE_WS_SCHEDULER_URL=[http://192.168.1.78:8080/ws-attendance](http://192.168.1.78:8080/ws-attendance)
```

## 🧩 주요 컴포넌트

### Dashboard
대시보드 메인 컴포넌트로 전체 검사 현황, 센서 검사, 외관 검사 통계를 표시합니다.

**주요 기능:**
- REST API를 통한 초기 데이터 로드
- WebSocket을 통한 실시간 통계 업데이트
- 원형 차트를 통한 데이터 시각화
- 센서 상세 분석 모달

### Progress
공정 진행 상태를 시각적으로 표시하는 컴포넌트입니다.

**주요 기능:**
- WebSocket `progress` 이벤트 수신
- 공정 단계별 상태 표시 (pending/ok/error)
- 현재 차량 ID 표시
- 불량 발생 시 즉시 빨간색 표시

### DefectLog
불량 로그를 조회하고 관리하는 컴포넌트입니다.

**주요 기능:**
- 외관/센서 불량 로그 분리 표시
- 페이지네이션
- 이미지 미리보기 및 상세 모달
- 실시간 불량 로그 추가
- 불량 발생 시 공정 단계와 연동

### PowerToggle
공정 시스템의 전원을 제어하는 컴포넌트입니다.

**주요 기능:**
- 전원 ON/OFF 토글
- 전원 상태 시각적 표시
- 백엔드 API 연동

### Schedule
스케줄 관리의 메인 컴포넌트로 데이터 페칭 및 실시간 구독을 총괄합니다.

**주요 기능:**
- 초기 사원 목록 및 월별 스케줄 데이터 로드
- STOMP 웹소켓 구독 및 실시간 이벤트 처리
- 공휴일 API 통신 및 상태 저장

### ScheduleHeader
달력 컨트롤러와 관리자용 필터 도구를 포함합니다.

**주요 기능:**
- 월 이동 및 연도/월 표시
- 지점 선택 및 해당 지점 사원 목록 동적 바인딩
- 기간(Range) 선택기 및 입력값 검증(Validation)

### ScheduleBody
7열 그리드 형식의 실제 달력을 렌더링합니다.

**주요 기능:**
- date-fns 기반의 날짜 계산 및 그리드 생성
- 선택된 기간(Range)에 대한 시각적 하이라이트 처리
- 스케줄 상태별 컬러 코드 매핑 (휴가, 지각, 결근 등)

### Manager
관리자가 스케줄 상태를 변경하거나 기록을 삭제하는 팝업입니다.

**주요 기능:**
- 선택된 날짜/기간 및 사원 정보 표시
- 스케줄 상태 옵션 제공 (휴가, 반차, 연차, 병가, 퇴근 등)
- 서버 API 연동을 통한 데이터 업데이트/삭제 요청

## 전산(Computation) 모듈
- 위치: 상단 탭 `전산 시스템` (관리자 비밀번호 입력 후 접근)
- **주요 기능:**
  - 사원 기본 정보 및 누적 급여 조회 (`GET /auth/info/all`, `GET /api/admin/attendance/salary/all-summary`)
  - 연차/병가 차감 (`POST /api/admin/attendance/update`), 차감 전 확인 모달 표시
  - STOMP `/topic/attendance/admin` 구독으로 급여/연차 실시간 반영
- **화면 구성:**
  - 헤더: 새로고침 버튼 (`ComputationHeader`)
  - 테이블: 사번/성명/부서/기본급/누적월급/차감금액, 연차·병가 차감 버튼 (`ComputationTable`)
  - 모달: 차감 확인 (`LeaveConfirmModal`)
  - 푸터: 검산 완료 버튼 (`ComputationFooter`)
- **동작 흐름:**
  1) 진입 시 사원·급여 데이터 병합 로드
  2) 연차/병가 버튼 클릭 → 확인 모달 → `POST /api/admin/attendance/update`
  3) 백엔드가 발행한 STOMP 메시지로 급여/연차 실시간 갱신

## Chat
- 프로토콜: STOMP over SockJS (`getStompClient`)
- 구독/발행:
  - Subscribe: `/topic/public`
  - Send: `/app/chat.addUser` (입장), `/app/chat.sendMessage` (채팅)
- UX:
  - 플로팅 버튼(💬)으로 창 열기/닫기
  - 전체화면 토글, 투명도 슬라이더(0.3~1)
  - 마지막 메시지와 동일한 내용·보낸이 중복 필터
  - 연결 안 됐을 때 입력/전송 비활성화
- UI 스타일 하이라이트:
  - 반투명 카드, 커스텀 스크롤바, 내/타인 말풍선 색상 구분
  - 시간 표시, JOIN 배지 스타일

## 🔄 상태 관리

### Redux Store 구조

```javascript
{
  processStatus: {
    processStatus: {
      'start': 'pending' | 'ok',
      'sensor': 'pending' | 'ok' | 'error',
      'case': 'pending' | 'ok' | 'error',
      'drive': 'pending' | 'ok' | 'error',
      'end': 'pending' | 'ok' | 'error'
    },
    currentCarId: number | null
  }, 

  attendance: {
    events: [],           
    holidays: [],        
    selectedEmp: {        
      id: number | 'all',
      name: string 
    },
    selectedRange: {     
      start: 'YYYY-MM-DD',
      end: 'YYYY-MM-DD'
    }
  }
}
```

### 주요 Actions

- `setStart({ car_id })`: 공정 시작 및 차량 ID 설정
- `setSensor({ status })`: 센서 단계 상태 설정
- `setCase({ status })`: 케이스 단계 상태 설정
- `setDrive({ status })`: 드라이브 단계 상태 설정
- `setEnd({ status })`: END 단계 상태 설정
- `setStepError({ stepId })`: 특정 단계를 error로 설정
- `resetProcessStatus()`: 전체 상태 초기화
- `setEvents(data):` 월별 스케줄 로그 저장 및 실시간 업데이트 반영
- `setSelectedEmp(emp)` : 특정 사원 또는 전체 사원 설정
- `setSelecetedRange({ start, end })` : 날짜 기간 설정

### 상태 보호 로직

- error 상태는 'ok' 신호로 덮어쓰이지 않도록 보호됩니다. 이는 불량 발생 후 정상 신호가 와도 불량 상태를 유지하기 위함입니다.
- 특정 사원을 선택한 상태에서 웹소켓 수신 시, 해당 사원의 ID와 일치하는 데이터만 필터링하여 업데이트 합니다.
- '전체 지점'에서 '강동' 등 특정 지점 선택 시 events 초기화 및 해당 지점 데이터 재요청 합니다.

## 📡 WebSocket 이벤트

### 수신 이벤트

#### `progress`
공정 진행 상태 업데이트

```javascript
// Start
{ start: 'ok', car_id: 2 }

// Sensor OK
{ sensor: 'ok' }

// Case OK
{ case: 'ok' }

// Drive OK
{ drive: 'ok' }
```

#### `sensor_defect`
센서 불량 감지

```javascript
{
  car_id: 184,
  device: 'LED',
  result: 'DEFECT',
  created_at: '2025-12-31T12:03:11'
}
```

#### `camera_defect`
외관 불량 감지

```javascript
{
  car_id: 184,
  result: 'DEFECT',
  images: ['/path/to/image1.jpg', '/path/to/image2.jpg'],
  created_at: '2025-12-31T12:03:11'
}
```

#### `stats_update`
통계 데이터 업데이트

```javascript
{
  total_count: 100,
  overall: { ... },
  sensor: { ... },
  camera: { ... }
}
```

#### `car_added`
새 차량 추가

```javascript
{
  car_id: 185
}
```

#### `attendance_update`
실시간 스케줄 기록 업데이트

```javascript
{
  "employeeId": "all" | number,
  "monthlyLogs": [
    { 
      "workDate": "2026-01-09", 
      "status": "휴가" 
    },
    ...
  ]
}
```

### 이벤트 처리 로직

1. **공정 진행 상태**: `progress` 이벤트를 통해 각 단계의 상태를 업데이트
2. **불량 감지**: `sensor_defect` 또는 `camera_defect` 이벤트 수신 시 해당 공정 단계를 error로 설정
3. **자동 처리**: sensor/case/drive 중 하나라도 error가 되면 end도 즉시 error로 설정

## 🎨 디자인 시스템

### CSS Variables

프로젝트는 `src/variables.css`에 정의된 CSS 변수를 사용합니다.

**간격 (Spacing)**
- `--spacing-4` ~ `--spacing-40`: 4px ~ 40px

**폰트 크기 (Font Size)**
- `--font-size-9` ~ `--font-size-28`: 9px ~ 28px

**폰트 굵기 (Font Weight)**
- `--font-weight-500`, `--font-weight-600`, `--font-weight-700`, `--font-weight-900`

**보더 반경 (Border Radius)**
- `--radius-4` ~ `--radius-24`: 4px ~ 24px
- `--radius-full`: 50%

**색상 (Colors)**
- Primary, Secondary, Success, Error, Warning 등

## 🔐 인증

### 로그인
- 엔드포인트: `/auth/login`
- 요청 형식: `{ employeeNumber: string, password: string }`
- 응답: `{ access_token, refresh_token, employee: { name } }`

### 토큰 저장
- `localStorage`에 `access_token`, `refresh_token`, `name` 저장
- 페이지 새로고침 시 토큰 확인하여 자동 로그인

## 📝 주요 기능 상세

### 공정 단계 상태 관리

1. **Start**: 차량 검사 시작 시 `{start: 'ok', car_id}` 이벤트 수신
2. **Sensor**: LED 센서 OK 시 `{sensor: 'ok'}` 이벤트 수신
3. **Case**: 외관 검사 OK 시 `{case: 'ok'}` 이벤트 수신
4. **Drive**: WHEEL 센서 OK 시 `{drive: 'ok'}` 이벤트 수신
5. **End**: Drive OK 후 5초 뒤 자동으로 'ok' 설정

### 불량 처리 로직

- **센서 불량**: LED, BUZZER, ULTRASONIC 중 하나라도 DEFECT → sensor 단계 error
- **외관 불량**: 이미지가 있거나 result가 DEFECT → case 단계 error
- **자동 연동**: 불량 발생 시 end 단계도 즉시 error로 설정
- **상태 보호**: error 상태는 'ok' 신호로 덮어쓰이지 않음

### 실시간 업데이트 최적화

- Redux 상태 업데이트를 로그 추가보다 먼저 실행하여 시각적 피드백 지연 최소화
- `Progress.jsx`와 `DefectLog.jsx` 양쪽에서 이벤트 처리하여 빠른 반영

---

**© 2025 공정 시스템 관리 | Powered by React**

