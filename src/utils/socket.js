import { io } from 'socket.io-client';

const API_BASE = 'http://192.168.1.78:5000';

// 단일 socket 인스턴스 생성
const socket = io(API_BASE, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

export default socket;

