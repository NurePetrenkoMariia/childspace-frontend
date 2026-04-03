import React, { useState, useEffect, useRef } from 'react';
import groupIcon from '../../assets/icons/icons8-group.png';

import editIcon from '../../assets/icons/pencil-white.png';
import confirmIcon from '../../assets/icons/checkmark.png';
import cancelIcon from '../../assets/icons/cancel.png';
import deleteIcon from '../../assets/icons/trash.png';

import editIconDark from '../../assets/icons/pencil-black.png';
import deleteIconDark from '../../assets/icons/trash-black.png';
import confirmIconDark from '../../assets/icons/tick-black.png';
import cancelIconDark from '../../assets/icons/cancel-black.png';

import { useAuth } from '../../auth/AuthContext';
import api from '../../../api/axios';
import './ChatsPage.css';

const ChatsPage = () => {
    const { user } = useAuth();

    const isAdmin = user?.roles?.includes('SuperAdmin') || user?.roles?.includes('CenterAdmin');

    const [activeChatId, setActiveChatId] = useState(null);
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

    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const [participants, setParticipants] = useState([]);
    const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

    const [availableUsers, setAvailableUsers] = useState([]);
    const [isLoadingAvailableUsers, setIsLoadingAvailableUsers] = useState(false);

    const filteredUsersToAdd = availableUsers.filter(u =>
        (u.firstName + " " + u.lastName).toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newChatName, setNewChatName] = useState("");

    const filteredChats = chatsList.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDateSeparator = (dateString) => {
        const date = new Date(dateString);

        return date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    const getMessagesWithSeparators = (messagesList) => {
        const result = [];
        let currentDateLabel = null;

        messagesList.forEach((msg) => {
            const dateLabel = formatDateSeparator(msg.createdAt);

            if (dateLabel !== currentDateLabel) {
                result.push({
                    isSeparator: true,
                    label: dateLabel,
                    id: `sep-${msg.id}`
                });
                currentDateLabel = dateLabel;
            }
            result.push({
                isSeparator: false,
                data: msg
            });
        });

        return result;
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, activeChatId]);

    useEffect(() => {
        const fetchChats = async () => {
            setIsLoadingChats(true);
            try {
                const response = await api.get('/chat');
                const formattedChats = response.data.map(chat => ({
                    ...chat,
                    lastMessage: chat.lastMessage || null,
                    participants: chat.participantsCount || 0
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

    const handleDeleteChat = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Ви впевнені, що хочете видалити цей чат? Всі повідомлення будуть втрачені!")) {
            try {
                await api.delete(`/chat/${id}`);
                setChatsList(prevChats => prevChats.filter(chat => chat.id !== id));
                if (activeChatId === id) {
                    setActiveChatId(null);
                    setMessages([]);
                }
            } catch (error) {
                console.error("Помилка видалення чату:", error);
                alert("Не вдалося видалити чат.");
            }
        }
    }
    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeChatId) return;

            setIsLoadingMessages(true);
            try {
                const response = await api.get(`/message/chat/${activeChatId}`);
                console.log("Отримані повідомлення:", response.data);
                setMessages(response.data);
            } catch (error) {
                console.error("Помилка завантаження повідомлень:", error);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [activeChatId]);

    const handleSendMessage = async () => {
        if (newMessageText.trim() === "") return;

        try {
            const response = await api.post('/message/send', {
                chatId: activeChatId,
                content: newMessageText
            });

            const newMsg = response.data;

            setMessages([...messages, newMsg]);

            setNewMessageText("");
            scrollToBottom();

            setChatsList(prevChats => prevChats.map(chat => {
                if (chat.id === activeChatId) {
                    return {
                        ...chat,
                        lastMessage: newMsg
                    };
                }
                return chat;
            }));
        } catch (error) {
            console.error("Помилка відправки:", error);
            alert("Не вдалося відправити повідомлення.");
        }
    };

    const handleOpenParticipantsModal = async () => {
        if (!activeChatId) return;

        setIsParticipantsModalOpen(true);
        setIsLoadingParticipants(true);

        try {
            const response = await api.get(`/chat/${activeChatId}/participants`);
            setParticipants(response.data);
            setChatsList(prevChats => prevChats.map(chat =>
                chat.id === activeChatId
                    ? { ...chat, participants: response.data.length }
                    : chat

            ));

        } catch (error) {
            console.error("Помилка завантаження учасників чату:", error);
        } finally {
            setIsLoadingParticipants(false);
        }
    };

    const fetchAvailableUsers = async () => {
        setIsLoadingAvailableUsers(true);
        try {
            const response = await api.get('/user/available-for-chat');

            const existingParticipantIds = participants.map(p => p.id);
            const usersToAdd = response.data.filter(u => !existingParticipantIds.includes(u.id));

            setAvailableUsers(usersToAdd);
        } catch (error) {
            console.error("Помилка завантаження користувачів:", error);
        } finally {
            setIsLoadingAvailableUsers(false);
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
                            filteredChats.map(chat => {
                                const isActive = activeChatId === chat.id;

                                return (
                                    <div
                                        key={chat.id}
                                        className={`chats-list-item ${isActive ? 'active' : ''}`}
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
                                                        <img src={isActive ? confirmIcon : confirmIconDark} alt="Save" />
                                                    </button>
                                                    <button className="chat-inline-btn" onClick={cancelEditingChat}>
                                                        <img src={isActive ? cancelIcon : cancelIconDark} alt="Cancel" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="chat-name">{chat.name}</h3>
                                                    {isAdmin && (
                                                        <div className='chat-actions-container'>
                                                            <button
                                                                className="chat-edit-icon-btn"
                                                                onClick={(e) => startEditingChat(chat, e)}
                                                                title="Редагувати назву"
                                                            >
                                                                <img src={isActive ? editIcon : editIconDark} alt="Edit" />
                                                            </button>
                                                            <button
                                                                className="chat-edit-icon-btn chat-delete-icon-btn"
                                                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                                                title="Видалити чат"
                                                            >
                                                                <img src={isActive ? deleteIcon : deleteIconDark} alt="Delete" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {editingChatId !== chat.id && (
                                            <p className="chat-preview">
                                                {chat.lastMessage && chat.lastMessage !== "Чат створено" ? (
                                                    <>
                                                        <span style={{ fontWeight: 600, marginRight: '4px' }}>
                                                            {chat.lastMessage.senderId === user?.id
                                                                ? "Ви:"
                                                                : (chat.lastMessage.senderName ? `${chat.lastMessage.senderName}:` : "")
                                                            }
                                                        </span>
                                                        <span>
                                                            {chat.lastMessage.content || chat.lastMessage}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span style={{ fontStyle: 'italic', opacity: 0.7 }}>
                                                        {chat.lastMessage === "Чат створено" ? "Чат створено" : "Немає повідомлень"}
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                );
                            })
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
                            onClick={handleOpenParticipantsModal}
                            style={{ cursor: 'pointer' }}
                        >
                            <img src={groupIcon} alt="Group" className="group-icon" />
                            <span>{chatsList.find(c => c.id === activeChatId)?.participants} учасників</span>
                        </div>
                    </div>

                    <div className="chat-messages-area">
                        {getMessagesWithSeparators(messages).map(item => {
                            if (item.isSeparator) {
                                return (
                                    <div key={item.id} className="chat-date-separator">
                                        {item.label}
                                    </div>
                                );
                            }
                            const msg = item.data;
                            return (
                                <div key={msg.id} className={`message-wrapper ${msg.senderId === user?.id ? 'mine' : 'others'}`}>
                                    <div className="message-bubble">
                                        {msg.senderId !== user?.id && <div className="message-sender">{msg.senderName}</div>}
                                        <div className="message-text">{msg.content}</div>
                                        <div className="message-time">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                                if (e.key === 'Enter') handleSendMessage();
                            }}
                        />
                        <button
                            className="send-msg-btn"
                            disabled={newMessageText.trim() === ""}
                            onClick={handleSendMessage}
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
                            {isAdmin && (
                                <button className="add-entity-btn  add-user-btn"
                                    onClick={() => {
                                        setIsAddUserModalOpen(true);
                                        fetchAvailableUsers();
                                    }}
                                >
                                    + Додати користувача
                                </button>
                            )}
                        </div>

                        <div className="participants-list">
                            {isLoadingParticipants ? (
                                <p style={{ textAlign: 'center', color: '#9384A6' }}>Завантаження...</p>
                            ) : participants.length > 0 ? (
                                participants.map(participant => (
                                    <div key={participant.id} className="participant-item">
                                        <div className="participant-info">
                                            <div className="participant-avatar">
                                                {participant.firstName ? participant.firstName.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span className="participant-name">
                                                {participant.firstName} {participant.lastName}
                                            </span>
                                        </div>
                                        {participant.email !== 'superadmin@childspace.com' && (
                                            <button
                                                className="remove-participant-btn"
                                                onClick={() => {
                                                    // логіка видалення
                                                    console.log("Видалити користувача з ID:", participant.id);
                                                }}
                                            >
                                                Видалити
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
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
                            {isLoadingAvailableUsers ? (
                                <p style={{ textAlign: 'center', color: '#9384A6', margin: '20px 0' }}>Завантаження списку...</p>
                            ) :
                                filteredUsersToAdd.length > 0 ? (
                                    filteredUsersToAdd.map(user => (
                                        <div key={user.id} className="participant-item">
                                            <div className="participant-info">
                                                <div className="participant-avatar">
                                                    {user.firstName.charAt(0)}
                                                </div>
                                                <span className="participant-name">{user.firstName} {user.lastName}</span>
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