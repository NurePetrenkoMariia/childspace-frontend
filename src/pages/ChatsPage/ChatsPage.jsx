import React, { useState, useEffect, useRef } from 'react';
import groupIcon from '../../assets/icons/icons8-group.png';
import editIcon from '../../assets/icons/pencil-black.png';
import confirmIcon from '../../assets/icons/checkmark.png';
import cancelIcon from '../../assets/icons/cancel.png';
import { useAuth } from '../../auth/AuthContext';
import api from '../../../api/axios';
import './ChatsPage.css';

const ChatsPage = () => {
    const { user } = useAuth();

    const isAdmin = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('CenterAdmin');

    const [activeChatId, setActiveChatId] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [newMessageText, setNewMessageText] = useState("");
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [editingChatId, setEditingChatId] = useState(null);
    const [editedChatName, setEditedChatName] = useState("");

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const [chatsList, setChatsList] = useState([]);
    const [isLoadingChats, setIsLoadingChats] = useState(false);

    const currentMessages = [
        { id: 1, sender: "Олена", text: "Lorem ipsum", time: "20:15", isMine: false },
        { id: 2, sender: "Ви", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eu imperdiet metus. Nunc placerat venenatis arcu at sagittis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. mi a sagittis scelerisque.", time: "20:25", isMine: true },
        { id: 3, sender: "Денис", text: "Lorem ipsum", time: "20:25", isMine: false },
        { id: 4, sender: "Софія (викладач)", text: "Lorem ipsum", time: "20:25", isMine: false },
    ];

    const [currentParticipants, setCurrentParticipants] = useState([
        { id: 1, name: "Софія" },
        { id: 2, name: "Олена" },
        { id: 3, name: "Денис" },
        { id: 4, name: "Олексій" },
        { id: 5, name: "Марія" },
        { id: 6, name: "Іван" }
    ]);

    const allSystemUsers = [
        { id: 101, name: "Анна (викладач)" },
        { id: 102, name: "Максим" },
        { id: 103, name: "Катерина" },
        { id: 104, name: "Олександр (викладач)" },
        { id: 105, name: "Вікторія" },
        { id: 106, name: "Дмитро" }
    ];

    const filteredUsersToAdd = allSystemUsers.filter(user =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newChatName, setNewChatName] = useState("");

    const filteredChats = chatsList.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages, activeChatId]);

    useEffect(() => {
        const fetchChats = async () => {
            setIsLoadingChats(true);
            try {
                const response = await api.get('/chat');
                const formattedChats = response.data.map(chat => ({
                    ...chat,
                    lastMessage: "Немає повідомлень",
                    participants: 0
                }));

                formattedChats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setChatsList(formattedChats);

                if (formattedChats.length > 0) {
                    setActiveChatId(formattedChats[0].id);
                }
            } catch (error) {
                console.error("Помилка завантаження чатів:", error);
            } finally {
                setIsLoadingChats(false);
            }
        };

        fetchChats();
    }, []);

    const handleCreateChat = async () => {
        if (newChatName.trim() === "") return;

        try {
            const response = await api.post('/chat', {
                name: newChatName
            });

            const newChat = response.data;

            newChat.lastMessage = "Чат створено";
            newChat.participants = 1;

            setChatsList([newChat, ...chatsList]);

            setNewChatName("");
            setIsModalOpen(false);
            setActiveChatId(newChat.id);
        } catch (error) {
            console.error("Помилка при створенні чату:", error);
            alert("Не вдалося створити чат.");
        }
    };

    const startEditingChat = (chat, e) => {
        e.stopPropagation();
        setEditingChatId(chat.id);
        setEditedChatName(chat.name);
    };

    const cancelEditingChat = (e) => {
        e.stopPropagation();
        setEditingChatId(null);
        setEditedChatName("");
    };

    const saveChatEdit = async (id, e) => {
        e.stopPropagation();
        if (editedChatName.trim() === "") return;

        try {
            await api.put(`/chat/${id}`, { name: editedChatName });

            setChatsList(prevChats => prevChats.map(chat =>
                chat.id === id ? { ...chat, name: editedChatName } : chat
            ));

            setEditingChatId(null);
        } catch (error) {
            console.error("Помилка редагування чату:", error);
            alert("Не вдалося оновити назву чату.");
        }
    };

    return (
        <div className="chats-container">
            <div className="chat-title-row">
                <h1 className="chat-title">Чати</h1>
            </div>

            <div className="chats-layout">
                <div className="chats-sidebar">
                    <div className="chats-action-bar">

                        <div className="chats-search-group">
                            <input
                                type="text"
                                placeholder="Пошук..."
                                className="filter-input chats-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            className="create-chat-btn"
                            onClick={() => setIsModalOpen(true)}
                            title="Створити новий чат"
                        >
                            +
                        </button>

                    </div>
                    <div className="chats-sidebar-list">
                        {filteredChats.length > 0 ? (
                            filteredChats.map(chat => (
                                <div
                                    key={chat.id}
                                    className={`chats-list-item ${activeChatId === chat.id ? 'active' : ''}`}
                                    onClick={() => setActiveChatId(chat.id)}
                                >
                                    <div className="chat-item-header">
                                        {editingChatId === chat.id ? (
                                            <div className="chat-edit-mode" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    value={editedChatName}
                                                    onChange={(e) => setEditedChatName(e.target.value)}
                                                    className="chat-inline-input"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveChatEdit(chat.id, e);
                                                        if (e.key === 'Escape') cancelEditingChat(e);
                                                    }}
                                                />
                                                <button className="chat-inline-btn" onClick={(e) => saveChatEdit(chat.id, e)}>
                                                    <img src={confirmIcon} alt="Save" />
                                                </button>
                                                <button className="chat-inline-btn" onClick={cancelEditingChat}>
                                                    <img src={cancelIcon} alt="Cancel" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="chat-name">{chat.name}</h3>
                                                {isAdmin && (
                                                    <button
                                                        className="chat-edit-icon-btn"
                                                        onClick={(e) => startEditingChat(chat, e)}
                                                        title="Редагувати назву"
                                                    >
                                                        <img src={editIcon} alt="Edit" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {editingChatId !== chat.id && (
                                        <p className="chat-preview">{chat.lastMessage}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', color: '#9384A6', marginTop: '20px' }}>
                                Чати не знайдені
                            </div>
                        )}
                    </div>
                </div>

                <div className="chat-window">
                    <div className="chat-window-header">
                        <h2>{chatsList.find(c => c.id === activeChatId)?.name}</h2>
                        <div
                            className="chat-participants"
                            onClick={() => setIsParticipantsModalOpen(true)}
                            style={{ cursor: 'pointer' }}
                        >
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

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Створити новий чат</h2>

                        <div className="form-group">
                            <label>Назва чату</label>
                            <input
                                type="text"
                                placeholder="Введіть назву..."
                                className="chat-input-field"
                                value={newChatName}
                                onChange={(e) => setNewChatName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setNewChatName("");
                                }}
                            >
                                Скасувати
                            </button>

                            <button
                                className="send-msg-btn"
                                onClick={handleCreateChat}
                                disabled={newChatName.trim() === ""}
                            >
                                Створити
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {isParticipantsModalOpen && (
                <div className="modal-overlay" onClick={() => setIsParticipantsModalOpen(false)}>
                    <div className="modal-content participants-modal" onClick={e => e.stopPropagation()}>
                        <div className="participants-header">
                            <h2 className="modal-title">Учасники чату</h2>
                            <button className="add-entity-btn  add-user-btn"
                                onClick={() => setIsAddUserModalOpen(true)}
                            >
                                + Додати користувача
                            </button>
                        </div>

                        <div className="participants-list">
                            {currentParticipants.map(participant => (
                                <div key={participant.id} className="participant-item">
                                    <div className="participant-info">
                                        <div className="participant-avatar">
                                            {participant.name.charAt(0)}
                                        </div>
                                        <span className="participant-name">{participant.name}</span>
                                    </div>
                                    <button
                                        className="remove-participant-btn"
                                        onClick={() => {
                                            setCurrentParticipants(prev => prev.filter(p => p.id !== participant.id));
                                        }}
                                    >
                                        Видалити
                                    </button>
                                </div>
                            ))}

                            {currentParticipants.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#9384A6' }}>Немає учасників</p>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setIsParticipantsModalOpen(false)}
                            >
                                Закрити
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddUserModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 1001 }} onClick={() => setIsAddUserModalOpen(false)}>
                    <div className="modal-content participants-modal" onClick={e => e.stopPropagation()}>

                        <div className="participants-header" style={{ marginBottom: '15px' }}>
                            <h2 className="modal-title">Додати користувача</h2>
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <input
                                type="text"
                                placeholder="Пошук за іменем..."
                                className="chat-input-field"
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="participants-list">
                            {filteredUsersToAdd.length > 0 ? (
                                filteredUsersToAdd.map(user => (
                                    <div key={user.id} className="participant-item">
                                        <div className="participant-info">
                                            <div className="participant-avatar">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="participant-name">{user.name}</span>
                                        </div>

                                        <button
                                            className="add-participant-btn"
                                            onClick={() => {
                                                console.log("Додаємо користувача:", user.name);
                                                // логіка додавання
                                            }}
                                        >
                                            Додати
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#9384A6', margin: '20px 0' }}>
                                    Користувачів не знайдено
                                </p>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => {
                                    setIsAddUserModalOpen(false);
                                    setUserSearchTerm("");
                                }}
                            >
                                Назад
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ChatsPage;