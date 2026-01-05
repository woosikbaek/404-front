import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
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

    useEffect(() => {
        // 연결 함수 호출
        const socket = new SockJS('http://localhost:8080/ws-chat');
        stompClientRef.current = Stomp.over(socket);

        stompClientRef.current.connect({}, onConnected, onError);

        return () => {
            if (stompClientRef.current) stompClientRef.current.disconnect();
        };
    }, []);

    // 새 메시지가 올 때마다 스크롤 아래로
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const onConnected = () => {
        setUserData(prev => ({ ...prev, connected: true }));
        
        // 서버로부터 메시지 수신 구독
        stompClientRef.current.subscribe('/topic/public', (payload) => {
            const newMessage = JSON.parse(payload.body);
            setMessages(prev => [...prev, newMessage]);
        });

        // 입장 알림 보내기 (백엔드 addUser 엔드포인트)
        sendValue('JOIN', `${userData.username}님이 입장하셨습니다.`);
    };

    const onError = (err) => {
        console.log("연결 에러: ", err);
    };

    const sendValue = (type, content) => {
        if (stompClientRef.current) {
            const chatMessage = {
                sender: userData.username,
                content: content || userData.message,
                type: type
            };

            const destination = type === 'JOIN' ? "/app/chat.addUser" : "/app/chat.sendMessage";
            
            stompClientRef.current.send(destination, {}, JSON.stringify(chatMessage));
            setUserData(prev => ({ ...prev, message: '' }));
        }
    };

    return (
        <div className={styles.floatingContainer}>
            {isOpen ? (
                <div className={styles.chatBox}>
                    <div className={styles.header}>
                        <span>실시간 채팅창</span>
                        <button onClick={() => setIsOpen(false)} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}>X</button>
                    </div>

                    <div ref={scrollRef} className={styles.messageArea}>
                        {messages.map((msg, index) => (
                            <div key={index} className={msg.type === 'JOIN' ? styles.joinText : styles.msgBubble}>
                                {msg.type !== 'JOIN' && <b>{msg.sender}: </b>}
                                {msg.content}
                            </div>
                        ))}
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            className={styles.input}
                            type="text"
                            value={userData.message}
                            onChange={(e) => setUserData({ ...userData, message: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && sendValue('CHAT')}
                            placeholder="메시지 입력..."
                        />
                        <button className={styles.sendBtn} onClick={() => sendValue('CHAT')}>전송</button>
                    </div>
                </div>
            ) : (
                <button className={styles.openBtn} onClick={() => setIsOpen(true)}>💬</button>
            )}
        </div>
    );
};

export default Chat;