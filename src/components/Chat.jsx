import React, { useState, useEffect, useRef } from 'react';
import { getStompClient } from '../utils/socket';
import styles from './Chat.module.css';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState({
    username: localStorage.getItem('name') || '익명',
    connected: false,
    message: ''
  });

  const stompClientRef = useRef(null);
  const scrollRef = useRef(null);
  // 구독 중복 방지를 위한 플래그
  const isSubscribed = useRef(false);

  useEffect(() => {
    // 이미 연결되어 있거나 구독 중이면 중단
    if (stompClientRef.current?.connected && isSubscribed.current) return;

    const client = getStompClient();
    stompClientRef.current = client;

    client.connect({}, () => {
      setUserData(prev => ({ ...prev, connected: true }));

      // 중복 구독 방지 체크
      if (!isSubscribed.current) {
        client.subscribe('/topic/public', (payload) => {
          const newMessage = JSON.parse(payload.body);

          // 클라이언트 측 중복 검사 (ID가 있다면 더 정확하지만, 내용과 시간으로 간단히 체크 가능)
          setMessages(prev => {
            // 마지막 메시지와 동일한지 확인 (간단한 중복 방지)
            if (prev.length > 0) {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg.content === newMessage.content && lastMsg.sender === newMessage.sender && lastMsg.type === newMessage.type) {
                return prev;
              }
            }
            return [...prev, newMessage];
          });
        });

        isSubscribed.current = true; // 구독 성공 표시

        client.send("/app/chat.addUser", {}, JSON.stringify({
          sender: userData.username,
          type: 'JOIN',
          content: `${userData.username}님이 입장하셨습니다.`
        }));
      }
    }, (err) => {
      console.error("STOMP 연결 실패:", err);
      setUserData(prev => ({ ...prev, connected: false }));
      isSubscribed.current = false;
    });

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect();
        isSubscribed.current = false;
      }
    };
  }, []); // 의존성 배열을 비워 처음에 한 번만 실행되게 함

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
                  {!isJoin && <b className={styles.senderName}>{msg.sender}</b>}
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