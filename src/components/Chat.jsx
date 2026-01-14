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

  const scrollToBottom = (smooth = false) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    if (stompClientRef.current?.connected && isSubscribed.current) return;

    const client = getStompClient();
    stompClientRef.current = client;

    client.connect({}, () => {
      setUserData(prev => ({ ...prev, connected: true }));

      if (!isSubscribed.current) {
        client.subscribe('/topic/public', (payload) => {
          const newMessage = JSON.parse(payload.body);
          // 시간 정보 추가
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          setMessages(prev => {
            const isDuplicate = prev.length > 0 &&
              prev[prev.length - 1].content === newMessage.content &&
              prev[prev.length - 1].sender === newMessage.sender;

            return isDuplicate ? prev : [...prev, { ...newMessage, time }];
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

  // 메시지 수신 시 부드러운 스크롤, 창 열 때는 즉시 스크롤
  useEffect(() => {
    if (isOpen) {
      const isNewMessage = messages.length > 0;
      setTimeout(() => scrollToBottom(isNewMessage), 50);
    }
  }, [messages, isOpen]);

  const sendValue = (type, content) => {
    if (stompClientRef.current?.connected) {
      const chatMessage = {
        sender: userData.username,
        content: (content || userData.message).trim(),
        type: type
      };
      if (!chatMessage.content && type === 'CHAT') return;

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
              <span>사내채팅</span>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.sliderWrapper}>
                <span className={styles.sliderIcon}>🌓</span>
                <input
                  type="range" min="0.3" max="1" step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(e.target.value)}
                  className={styles.opacitySlider}
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
              const isMine = msg.sender === userData.username;

              return (
                <div key={index} className={isJoin ? styles.joinText : (isMine ? styles.myMsgWrapper : styles.otherMsgWrapper)}>
                  {!isJoin && !isMine && <b className={styles.senderName}>{msg.sender}</b>}
                  <div className={isMine ? styles.myMsgRow : styles.otherMsgRow}>
                    <div className={isJoin ? styles.joinText : (isMine ? styles.myMsgBubble : styles.msgBubble)}>
                      <span className={styles.messageContent}>{msg.content || msg.message}</span>
                    </div>
                    {/* 시간 표시 추가 */}
                    {!isJoin && <span className={styles.chatTime}>{msg.time}</span>}
                  </div>
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