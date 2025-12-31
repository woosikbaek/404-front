import { configureStore } from '@reduxjs/toolkit';
import processStatusReducer from './slices/processStatusSlice';

export const store = configureStore({
  reducer: {
    processStatus: processStatusReducer,
  },
});

