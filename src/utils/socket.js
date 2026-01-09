import { io } from 'socket.io-client';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_CHAT = import.meta.env.VITE_WS_CHAT_URL;
const API_SCHEDULER = import.meta.env.VITE_WS_SCHEDULER_URL;

// 1. Socket.io 인스턴스 (5000번 서버용)
export const socket = io(API_BASE, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});

// 2. STOMP 클라이언트 생성 함수 (8080번 서버용)
export const getStompClient = () => {
    const sock = new SockJS(API_CHAT);
    const stompClient = Stomp.over(sock);
    return stompClient;
};
// 3. 스케줄 관리 클라이언트 생성 함수 (8080번 서버용)
export const getSchedulerClient = () => {
    const sock = new SockJS(API_SCHEDULER);
    const stompClient = Stomp.over(sock);
    return stompClient;
};
// 기본적으로는 Socket.io를 내보냄
export default socket;