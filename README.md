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

## 📁 프로젝트 구조

```
404-front/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── Dashboard.jsx    # 대시보드 메인 컴포넌트
│   │   ├── DefectLog.jsx    # 불량 로그 컴포넌트
│   │   ├── Progress.jsx     # 진행도 현황 컴포넌트
│   │   ├── Header.jsx       # 헤더 컴포넌트
│   │   ├── PowerToggle.jsx  # 전원 제어 컴포넌트
│   │   ├── SensorDetailModal.jsx  # 센서 상세 분석 모달
│   │   └── *.module.css     # 컴포넌트별 스타일
│   ├── store/               # Redux 상태 관리
│   │   ├── store.js         # Redux store 설정
│   │   ├── hooks.js         # Redux hooks
│   │   └── slices/
│   │       └── processStatusSlice.js  # 공정 상태 slice
│   ├── utils/
│   │   └── socket.js         # Socket.io 클라이언트 설정
│   ├── App.jsx              # 메인 앱 컴포넌트
│   ├── Login.jsx            # 로그인 컴포넌트
│   ├── main.jsx             # 앱 진입점
│   ├── variables.css        # 전역 CSS 변수
│   ├── index.css            # 전역 스타일
│   └── App.css              # 앱 스타일
├── package.json
├── vite.config.js
└── README.md
```

### 빌드

```bash
# 프로덕션 빌드
npm run build
```

### 미리보기

```bash
# 빌드된 파일 미리보기
npm run preview
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

### 상태 보호 로직

error 상태는 'ok' 신호로 덮어쓰이지 않도록 보호됩니다. 이는 불량 발생 후 정상 신호가 와도 불량 상태를 유지하기 위함입니다.

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

