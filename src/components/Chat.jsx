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
  const isSubscribed = useRef(false);

  // 스크롤 하단 이동 함수
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // 소켓 연결 및 구독
  useEffect(() => {
    if (stompClientRef.current?.connected && isSubscribed.current) return;

    const client = getStompClient();
    stompClientRef.current = client;

    client.connect({}, () => {
      setUserData(prev => ({ ...prev, connected: true }));

      if (!isSubscribed.current) {
        client.subscribe('/topic/public', (payload) => {
          const newMessage = JSON.parse(payload.body);
          setMessages(prev => {
            if (prev.length > 0) {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg.content === newMessage.content && lastMsg.sender === newMessage.sender && lastMsg.type === newMessage.type) {
                return prev;
              }
            }
            return [...prev, newMessage];
          });
        });

        isSubscribed.current = true;

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
  }, []);

  // [디테일 1] 새 메시지가 오거나, '채팅창을 열 때' 스크롤을 맨 아래로
  useEffect(() => {
    if (isOpen) {
      // 메시지가 로드될 시간을 짧게 주기 위해 setTimeout 사용
      setTimeout(scrollToBottom, 10);
    }
  }, [messages, isOpen]);

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
              <span>사내채팅 ♥</span>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.sliderWrapper}>
                <span className={styles.sliderIcon}>🌓</span>
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(e.target.value)}
                  className={styles.opacitySlider}
                  title="투명도 설정"
                />
              </div>
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