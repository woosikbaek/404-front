import React, { useState, useEffect, useRef } from 'react';
import { getStompClient } from '../utils/socket';
import styles from './Chat.module.css';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false); // 전체화면 상태
  const [opacity, setOpacity] = useState(1); // 투명도 상태
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState({
    username: localStorage.getItem('name') || '익명',
    connected: false,
    message: ''
  });

  const stompClientRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const client = getStompClient();
    stompClientRef.current = client;

    client.connect({}, () => {
      setUserData(prev => ({ ...prev, connected: true }));
      client.subscribe('/topic/public', (payload) => {
        const newMessage = JSON.parse(payload.body);
        setMessages(prev => [...prev, newMessage]);
      });

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendValue = (type, content) => {
    if (stompClientRef.current?.connected) {
      const chatMessage = {
        sender: userData.username,
        content: content || userData.message,
        type: type
      };
      const destination = type === 'JOIN' ? "/app/chat.addUser" : "/app/chat.sendMessage";
      stompClientRef.current.send(destination, {}, JSON.stringify(chatMessage));
      if (type === 'CHAT') setUserData(prev => ({ ...prev, message: '' }));
    }
  };

  // 전체화면 클래스 동적 결정
  const chatBoxClass = `${styles.chatBox} ${isMaximized ? styles.maximized : ''}`;

  return (
    <div className={styles.floatingContainer} style={{ opacity: opacity }}>
      {isOpen ? (
        <div className={chatBoxClass}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span>실시간 채팅 ({userData.connected ? "온라인" : "연결안됨"})</span>
            </div>
            <div className={styles.headerRight}>
              <input
                type="range" min="0.3" max="1" step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(e.target.value)}
                className={styles.opacitySlider}
                title="투명도 조절"
              />
              <button onClick={() => setIsMaximized(!isMaximized)} className={styles.actionBtn}>
                {isMaximized ? '🗗' : '🗖'}
              </button>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>✕</button>
            </div>
          </div>

          <div ref={scrollRef} className={styles.messageArea}>
            {messages.map((msg, index) => {
              const isJoin = msg.type === 'JOIN';
              return (
                <div key={index} className={isJoin ? styles.joinText : styles.msgBubble}>
                  {!isJoin && <b className={styles.senderName}>{msg.sender || "알 수 없음"}</b>}
                  <span className={styles.messageContent}>{msg.content || msg.message}</span>
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
              placeholder="메시지 입력..."
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