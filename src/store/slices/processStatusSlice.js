import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  processStatus: {
    'start': 'pending',
    'sensor': 'pending',
    'case': 'pending',
    'drive': 'pending',
    'end': 'pending'
  },
  currentCarId: null,
};

const processStatusSlice = createSlice({
  name: 'processStatus',
  initialState,
  reducers: {
    // start 이벤트 처리
    setStart: (state, action) => {
      const { car_id } = action.payload;
      state.processStatus.start = 'ok';
      state.processStatus.sensor = 'pending';
      state.processStatus.case = 'pending';
      state.processStatus.drive = 'pending';
      state.processStatus.end = 'pending';
      state.currentCarId = car_id;
    },
    
    // sensor 단계 처리
    setSensor: (state, action) => {
      const { status } = action.payload;
      // 이미 error 상태면 덮어쓰지 않음 (ok로 덮어쓰는 것 방지)
      if (state.processStatus.sensor === 'error' && status === 'ok') {
        return; // error 상태를 유지
      }
      state.processStatus.sensor = status;
    },
    
    // case 단계 처리
    setCase: (state, action) => {
      const { status } = action.payload;
      // 이미 error 상태면 덮어쓰지 않음 (ok로 덮어쓰는 것 방지)
      if (state.processStatus.case === 'error' && status === 'ok') {
        return; // error 상태를 유지
      }
      state.processStatus.case = status;
    },
    
    // drive 단계 처리
    setDrive: (state, action) => {
      const { status } = action.payload;
      // 이미 error 상태면 덮어쓰지 않음 (ok로 덮어쓰는 것 방지)
      if (state.processStatus.drive === 'error' && status === 'ok') {
        return; // error 상태를 유지
      }
      state.processStatus.drive = status;
    },
    
    // end 단계 처리
    setEnd: (state, action) => {
      const { status } = action.payload;
      state.processStatus.end = status;
    },
    
    // 센서 불량 처리 (sensor/case/drive 중 하나를 error로 설정)
    setStepError: (state, action) => {
      const { stepId } = action.payload;
      if (['sensor', 'case', 'drive'].includes(stepId)) {
        state.processStatus[stepId] = 'error';
      }
    },
    
    // 전체 상태 초기화
    resetProcessStatus: (state) => {
      state.processStatus = {
        'start': 'pending',
        'sensor': 'pending',
        'case': 'pending',
        'drive': 'pending',
        'end': 'pending'
      };
      state.currentCarId = null;
    },
  },
});

export const {
  setStart,
  setSensor,
  setCase,
  setDrive,
  setEnd,
  setStepError,
  resetProcessStatus,
} = processStatusSlice.actions;

export default processStatusSlice.reducer;

