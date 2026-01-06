import React, { useState, useEffect, useRef } from 'react';
import { getStompClient } from '../utils/socket';
import styles from './Chat.module.css';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState({
    username: 'User' + Math.floor(Math.random() * 100),
    connected: false,
    message: ''
  });

  const stompClientRef = useRef(null);
  const scrollRef = useRef(null);

  // 1. 소켓 연결 설정
  useEffect(() => {
    const client = getStompClient();
    stompClientRef.current = client;

    client.connect({}, () => {
      setUserData(prev => ({ ...prev, connected: true }));

      // 구독 시작
      client.subscribe('/topic/public', (payload) => {
        const newMessage = JSON.parse(payload.body);
        console.log("서버에서 받은 메시지 전체 구조:", newMessage); // 이 로그를 꼭 확인하세요!
        setMessages(prev => [...prev, newMessage]);
      });

      // 입장 알림 발송
      client.send("/app/chat.addUser", {}, JSON.stringify({
        sender: userData.username,
        type: 'JOIN',
        content: `${userData.username}님이 입장하셨습니다.`
      }));
    }, (err) => {
      console.error("STOMP 연결 실패:", err);
      setUserData(prev => ({ ...prev, connected: false }));
    });

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect();
      }
    };
  }, []);

  // 2. 메시지 수신 시 하단 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 3. 메시지 전송 함수
  const sendValue = (type, content) => {
    if (stompClientRef.current?.connected) {
      const chatMessage = {
        sender: userData.username,
        content: content || userData.message,
        type: type
      };

      const destination = type === 'JOIN' ? "/app/chat.addUser" : "/app/chat.sendMessage";
      stompClientRef.current.send(destination, {}, JSON.stringify(chatMessage));

      if (type === 'CHAT') {
        setUserData(prev => ({ ...prev, message: '' }));
      }
    }
  };

  return (
    <div className={styles.floatingContainer}>
      {isOpen ? (
        <div className={styles.chatBox}>
          <div className={styles.header}>
            <span>실시간 채팅 ({userData.connected ? "온라인" : "연결안됨"})</span>
            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>X</button>
          </div>

          <div ref={scrollRef} className={styles.messageArea}>
            {messages.map((msg, index) => {
              const isJoin = msg.type === 'JOIN';
              // 서버에서 오는 데이터 키값이 다를 경우를 대비해 변수로 할당 (null 체크)
              const sender = msg.sender || "알 수 없음";
              const content = msg.content || msg.message || ""; // content가 없으면 message라도 시도

              return (
                <div
                  key={index}
                  className={isJoin ? styles.joinText : styles.msgBubble}
                >
                  {!isJoin && (
                    <div style={{ marginBottom: '4px' }}>
                      <b style={{ color: '#007bff', fontSize: '11px' }}>{sender}</b>
                    </div>
                  )}
                  <span className={styles.messageContent}>{content}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.inputArea}>
            <input
              className={styles.input}
              type="text"
              value={userData.message}
              onChange={(e) => setUserData({ ...userData, message: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && sendValue('CHAT')}
              placeholder={userData.connected ? "메시지 입력..." : "서버 연결 중..."}
              disabled={!userData.connected}
            />
            <button
              className={styles.sendBtn}
              onClick={() => sendValue('CHAT')}
              disabled={!userData.connected || !userData.message.trim()}
            >
              전송
            </button>
          </div>
        </div>
      ) : (
        <button className={styles.openBtn} onClick={() => setIsOpen(true)}>💬</button>
      )}
    </div>
  );
};

export default Chat;