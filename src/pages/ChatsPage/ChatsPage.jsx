import React, { useState, useEffect, useRef } from 'react';
import searchIcon from '../../assets/icons/search-white.png';
import groupIcon from '../../assets/icons/icons8-group.png';
import { useAuth } from '../../auth/AuthContext';
import './ChatsPage.css';

const ChatsPage = () => {
    const { user } = useAuth();

    const isAdmin = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('CenterAdmin');

    const [activeChatId, setActiveChatId] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [newMessageText, setNewMessageText] = useState("");

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    const chatsList = [
        { id: 1, name: "Бісер Група 1", lastMessage: "Софія (викладач): Всім доброго дня, за...", participants: 6 },
        { id: 2, name: "Англійська Група 3", lastMessage: "Олена: Доброго вечора, підкажіть будь...", participants: 8 },
        { id: 3, name: "Укр. мова Група 1", lastMessage: "Дарина (викладач): Сьогодні буде робо...", participants: 5 },
        { id: 4, name: "Малювання Група 2", lastMessage: "Олексій: Найкраще підходять фарби д...", participants: 7 },
    ];

    const currentMessages = [
        { id: 1, sender: "Олена", text: "Lorem ipsum", time: "20:15", isMine: false },
        { id: 2, sender: "Ви", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eu imperdiet metus. Nunc placerat venenatis arcu at sagittis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. mi a sagittis scelerisque.", time: "20:25", isMine: true },
        { id: 3, sender: "Денис", text: "Lorem ipsum", time: "20:25", isMine: false },
        { id: 4, sender: "Софія (викладач)", text: "Lorem ipsum", time: "20:25", isMine: false },
    ];

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages, activeChatId]);


    return (
        <div className="chats-container">
            <div className="chat-title-row">
                <h1 className="chat-title">Чати</h1>
            </div>

            <div className="chats-action-bar">

                <div className="chats-search-group">
                    <input
                        type="text"
                        placeholder="Пошук..."
                        className="filter-input chats-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="apply-search-btn chats-apply-btn">
                        <img src={searchIcon} alt="Search" className="search-btn-icon" />
                        Застосувати
                    </button>
                </div>
                <button className="add-entity-btn create-chat-btn">
                    Створити новий чат
                </button>

            </div>
            <div className="chats-layout">
                <div className="chats-sidebar">
                    {chatsList.map(chat => (
                        <div
                            key={chat.id}
                            className={`chats-list-item ${activeChatId === chat.id ? 'active' : ''}`}
                            onClick={() => setActiveChatId(chat.id)}
                        >
                            <h3 className="chat-name">{chat.name}</h3>
                            <p className="chat-preview">{chat.lastMessage}</p>
                        </div>
                    ))}
                </div>

                <div className="chat-window">
                    <div className="chat-window-header">
                        <h2>{chatsList.find(c => c.id === activeChatId)?.name}</h2>
                        <div className="chat-participants">
                            <img src={groupIcon} alt="Group" className="group-icon" />
                            <span>{chatsList.find(c => c.id === activeChatId)?.participants} учасників</span>
                        </div>
                    </div>

                    <div className="chat-messages-area">
                        <div className="chat-date-separator">10 квітня</div>
                        {currentMessages.map(msg => (
                            <div key={msg.id} className={`message-wrapper ${msg.isMine ? 'mine' : 'others'}`}>
                                <div className="message-bubble">
                                    {!msg.isMine && <div className="message-sender">{msg.sender}</div>}
                                    <div className="message-text">{msg.text}</div>
                                    <div className="message-time">{msg.time}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            placeholder="Напишіть повідомлення..."
                            className="chat-input-field"
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newMessageText.trim() !== '') {
                                    console.log("Відправка:", newMessageText);
                                    setNewMessageText(""); 
                                }
                            }}
                        />
                        <button
                            className="send-msg-btn"
                            disabled={newMessageText.trim() === ""} 
                            onClick={() => {
                                console.log("Відправка:", newMessageText);
                                setNewMessageText(""); 
                            }}
                        >
                            Надіслати
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default ChatsPage;