import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { io } from 'socket.io-client'
import axios from 'axios'
import {
    setMessages,
    addMessage,
    setAdminId,
    closeChat,
} from '../../redux/chatReducer/chatReducer'

const ChatBox = () => {
    const [inputMessage, setInputMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const socketRef = useRef(null)
    const messagesEndRef = useRef(null)
    const dispatch = useDispatch()
    const { userId } = useSelector((state) => state.userReducer)
    const { messages, adminId } = useSelector((state) => state.chatReducer)

    // Connect socket and fetch admin info
    useEffect(() => {
        // Prevent double connection in StrictMode
        if (socketRef.current) return

        const newSocket = io('http://localhost:8080')
        socketRef.current = newSocket

        // Join room
        if (userId) {
            newSocket.emit('join_room', userId)
        }

        // Listen for messages
        newSocket.on('receive_message', (data) => {
            dispatch(addMessage(data))
        })

        // Typing indicator
        newSocket.on('user_typing', () => setIsTyping(true))
        newSocket.on('user_stop_typing', () => setIsTyping(false))

        // Fetch admin info
        axios
            .get('http://localhost:8080/chat/admin')
            .then((res) => {
                if (res.data.content) {
                    dispatch(setAdminId(res.data.content.user_id))
                }
            })
            .catch((err) => console.error('Error fetching admin:', err))

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }, [userId, dispatch])

    // Fetch chat history when adminId is available
    useEffect(() => {
        if (adminId && userId) {
            axios
                .get(
                    `http://localhost:8080/chat/history/${adminId}?currentUserId=${userId}`,
                )
                .then((res) => {
                    dispatch(setMessages(res.data.content))
                })
                .catch((err) => console.error('Error fetching chat history:', err))
        }
    }, [adminId, userId, dispatch])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = () => {
        if (!inputMessage.trim() || !socketRef.current || !adminId) return

        socketRef.current.emit('send_message', {
            senderId: userId,
            receiverId: adminId,
            message: inputMessage.trim(),
        })

        setInputMessage('')
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleTyping = () => {
        if (socketRef.current && adminId) {
            socketRef.current.emit('typing', { senderId: userId, receiverId: adminId })
            setTimeout(() => {
                if (socketRef.current) {
                    socketRef.current.emit('stop_typing', {
                        senderId: userId,
                        receiverId: adminId,
                    })
                }
            }, 2000)
        }
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '90px',
                right: '24px',
                width: '360px',
                height: '460px',
                backgroundColor: '#FFF',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1001,
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div
                style={{
                    background: '#485935',
                    color: '#FFF',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#CADBB7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            color: '#485935',
                            fontWeight: '700',
                        }}
                    >
                        A
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '15px' }}>
                            Chat with Admin
                        </div>
                        {isTyping && (
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>typing...</div>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => dispatch(closeChat())}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#FFF',
                        fontSize: '20px',
                        cursor: 'pointer',
                        padding: '4px',
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Messages area */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    backgroundColor: '#F5F7F0',
                }}
            >
                {messages.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            color: '#999',
                            marginTop: '40px',
                            fontSize: '14px',
                        }}
                    >
                        Start a conversation with admin!
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={msg.message_id || index}
                        style={{
                            display: 'flex',
                            justifyContent:
                                msg.sender_id === userId ? 'flex-end' : 'flex-start',
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '75%',
                                padding: '10px 14px',
                                borderRadius:
                                    msg.sender_id === userId
                                        ? '14px 14px 4px 14px'
                                        : '14px 14px 14px 4px',
                                backgroundColor:
                                    msg.sender_id === userId ? '#485935' : '#CADBB7',
                                color: msg.sender_id === userId ? '#FFF' : '#2D3B1E',
                                fontSize: '14px',
                                lineHeight: '1.4',
                                wordBreak: 'break-word',
                            }}
                        >
                            {msg.message}
                            <div
                                style={{
                                    fontSize: '10px',
                                    opacity: 0.6,
                                    marginTop: '4px',
                                    textAlign: 'right',
                                }}
                            >
                                {msg.created_at
                                    ? new Date(msg.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : ''}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div
                style={{
                    padding: '12px',
                    borderTop: '1px solid #E5E7EB',
                    display: 'flex',
                    gap: '8px',
                    backgroundColor: '#FFF',
                }}
            >
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                        setInputMessage(e.target.value)
                        handleTyping()
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '20px',
                        border: '1px solid #D1D5DB',
                        outline: 'none',
                        fontSize: '14px',
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim()}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: inputMessage.trim() ? '#485935' : '#D1D5DB',
                        color: '#FFF',
                        cursor: inputMessage.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        transition: 'background-color 0.2s',
                    }}
                >
                    <i className="fa fa-paper-plane"></i>
                </button>
            </div>
        </div>
    )
}

export default ChatBox
