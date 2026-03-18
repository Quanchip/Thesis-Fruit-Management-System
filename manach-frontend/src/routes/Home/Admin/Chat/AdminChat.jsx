import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { io } from 'socket.io-client'
import axios from 'axios'
import {
	setUnreadCounts,
	incrementUnread,
	clearUnread,
} from '../../../../redux/chatReducer/chatReducer'

const AdminChat = () => {
	const [conversations, setConversations] = useState([])
	const [activeChat, setActiveChat] = useState(null)
	const [messages, setMessages] = useState([])
	const [inputMessage, setInputMessage] = useState('')
	const [isTyping, setIsTyping] = useState(false)
	const socketRef = useRef(null)
	const messagesEndRef = useRef(null)
	const activeChatRef = useRef(null)
	const dispatch = useDispatch()
	const { userId } = useSelector((state) => state.userReducer)
	const { unreadCounts } = useSelector((state) => state.chatReducer)

	// Keep a ref of activeChat so socket handler can read latest value
	useEffect(() => {
		activeChatRef.current = activeChat
	}, [activeChat])

	// Connect socket
	useEffect(() => {
		if (socketRef.current) return

		const newSocket = io('http://localhost:8080')
		socketRef.current = newSocket

		if (userId) {
			newSocket.emit('join_room', userId)
			newSocket.emit('join_admin_room')
		}

		newSocket.on('receive_message', (data) => {
			// Deduplicate
			// Only add to the chat window if this message belongs to the active conversation
			const currentActive = activeChatRef.current
			if (currentActive) {
				const otherUserForMsg =
					String(data.sender_id) === String(userId)
						? String(data.receiver_id)
						: String(data.sender_id)
				if (String(currentActive.user_id) === otherUserForMsg) {
					setMessages((prev) => {
						const exists = prev.find(
							(m) => m.message_id === data.message_id,
						)
						if (exists) return prev
						return [...prev, data]
					})
				}
			}

			// Determine the customer user id
			const otherUserId =
				String(data.sender_id) === String(userId)
					? data.receiver_id
					: data.sender_id

			// Increment unread if message is from customer and not the active chat
			if (String(data.sender_id) !== String(userId)) {
				const currentActive = activeChatRef.current
				if (
					!currentActive ||
					String(currentActive.user_id) !== String(otherUserId)
				) {
					dispatch(incrementUnread(otherUserId))
				}
			}

			// Update conversation list
			setConversations((prev) => {
				const updated = prev.map((conv) => {
					if (String(conv.user_id) === String(otherUserId)) {
						return {
							...conv,
							last_message: data.message,
							last_message_time: data.created_at,
						}
					}
					return conv
				})

				const exists = updated.find(
					(conv) => String(conv.user_id) === String(otherUserId),
				)
				if (!exists && String(data.sender_id) !== String(userId)) {
					updated.unshift({
						user_id: data.sender_id,
						full_name: data.sender_name || 'Customer',
						last_message: data.message,
						last_message_time: data.created_at,
					})
				}

				return updated
			})
		})

		newSocket.on('user_typing', () => setIsTyping(true))
		newSocket.on('user_stop_typing', () => setIsTyping(false))

		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect()
				socketRef.current = null
			}
		}
	}, [userId, dispatch])

	// Fetch conversations and initialize unread counts
	useEffect(() => {
		if (userId) {
			axios
				.get(`http://localhost:8080/chat/conversations?adminId=${userId}`)
				.then((res) => {
					const convs = res.data.content
					setConversations(convs)

					// Build initial unread counts from API
					const counts = {}
					convs.forEach((conv) => {
						if (conv.unread_count > 0) {
							counts[String(conv.user_id)] = conv.unread_count
						}
					})
					dispatch(setUnreadCounts(counts))
				})
				.catch((err) => console.error('Error fetching conversations:', err))
		}
	}, [userId, dispatch])

	// Fetch messages when active chat changes
	useEffect(() => {
		if (activeChat && userId) {
			axios
				.get(
					`http://localhost:8080/chat/admin-history/${activeChat.user_id}`,
				)
				.then((res) => setMessages(res.data.content))
				.catch((err) => console.error('Error fetching messages:', err))
		}
	}, [activeChat, userId])

	// Auto-scroll
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	const handleSelectChat = (conv) => {
		setActiveChat(conv)
		// Clear unread for this conversation
		dispatch(clearUnread(conv.user_id))
		// Mark as read on server
		axios
			.get(
				`http://localhost:8080/chat/history/${conv.user_id}?currentUserId=${userId}`,
			)
			.catch(() => {})
	}

	const handleSend = () => {
		if (!inputMessage.trim() || !socketRef.current || !activeChat) return

		socketRef.current.emit('send_message', {
			senderId: userId,
			receiverId: activeChat.user_id,
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

	return (
		<div className="flex h-screen" style={{ backgroundColor: '#F5F7F0' }}>
			{/* Conversation List */}
			<div
				style={{
					width: '320px',
					borderRight: '1px solid #E5E7EB',
					backgroundColor: '#FFF',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<div
					style={{
						padding: '20px',
						borderBottom: '1px solid #E5E7EB',
					}}
				>
					<h2
						style={{
							color: '#485935',
							fontSize: '22px',
							fontWeight: '700',
							margin: 0,
						}}
					>
						Messages
					</h2>
				</div>
				<div style={{ flex: 1, overflowY: 'auto' }}>
					{conversations.length === 0 && (
						<div
							style={{
								padding: '40px 20px',
								textAlign: 'center',
								color: '#999',
								fontSize: '14px',
							}}
						>
							No conversations yet
						</div>
					)}
					{conversations.map((conv) => {
						const unread = unreadCounts[String(conv.user_id)] || 0
						const isActive = activeChat?.user_id === conv.user_id

						return (
							<div
								key={conv.user_id}
								onClick={() => handleSelectChat(conv)}
								style={{
									padding: '14px 20px',
									cursor: 'pointer',
									backgroundColor: isActive
										? '#F0F4E8'
										: unread > 0
											? '#F7FAF2'
											: 'transparent',
									borderBottom: '1px solid #F3F4F6',
									borderLeft: unread > 0 ? '3px solid #485935' : '3px solid transparent',
									transition: 'background-color 0.2s',
								}}
								onMouseEnter={(e) => {
									if (!isActive) {
										e.currentTarget.style.backgroundColor = '#F9FAFB'
									}
								}}
								onMouseLeave={(e) => {
									if (!isActive) {
										e.currentTarget.style.backgroundColor =
											unread > 0 ? '#F7FAF2' : 'transparent'
									}
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '12px',
									}}
								>
									{/* Avatar with badge */}
									<div style={{ position: 'relative', flexShrink: 0 }}>
										<div
											style={{
												width: '42px',
												height: '42px',
												borderRadius: '50%',
												backgroundColor: '#CADBB7',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontSize: '16px',
												fontWeight: '700',
												color: '#485935',
											}}
										>
											{conv.full_name?.charAt(0)?.toUpperCase() ||
												'U'}
										</div>
										{unread > 0 && (
											<div
												style={{
													position: 'absolute',
													top: '-4px',
													right: '-4px',
													backgroundColor: '#EF4444',
													color: '#FFF',
													fontSize: '11px',
													fontWeight: '700',
													width: unread > 9 ? '22px' : '18px',
													height: '18px',
													borderRadius: '9px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													border: '2px solid #FFF',
												}}
											>
												{unread > 99 ? '99+' : unread}
											</div>
										)}
									</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												fontWeight: unread > 0 ? '700' : '600',
												fontSize: '14px',
												color: '#1F2937',
											}}
										>
											{conv.full_name || 'Unknown User'}
										</div>
										<div
											style={{
												fontSize: '13px',
												color: unread > 0 ? '#374151' : '#6B7280',
												fontWeight: unread > 0 ? '600' : '400',
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
											}}
										>
											{conv.last_message}
										</div>
									</div>
									<div
										style={{
											fontSize: '11px',
											color: unread > 0 ? '#485935' : '#9CA3AF',
											fontWeight: unread > 0 ? '600' : '400',
											flexShrink: 0,
										}}
									>
										{conv.last_message_time
											? new Date(
													conv.last_message_time,
												).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
												})
											: ''}
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</div>

			{/* Chat Window */}
			<div
				style={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{activeChat ? (
					<>
						{/* Chat Header */}
						<div
							style={{
								padding: '16px 24px',
								borderBottom: '1px solid #E5E7EB',
								backgroundColor: '#FFF',
								display: 'flex',
								alignItems: 'center',
								gap: '12px',
							}}
						>
							<div
								style={{
									width: '40px',
									height: '40px',
									borderRadius: '50%',
									backgroundColor: '#CADBB7',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: '16px',
									fontWeight: '700',
									color: '#485935',
								}}
							>
								{activeChat.full_name?.charAt(0)?.toUpperCase() || 'U'}
							</div>
							<div>
								<div
									style={{
										fontWeight: '600',
										fontSize: '16px',
										color: '#1F2937',
									}}
								>
									{activeChat.full_name || 'Unknown User'}
								</div>
								{isTyping && (
									<div style={{ fontSize: '12px', color: '#93A267' }}>
										typing...
									</div>
								)}
							</div>
						</div>

						{/* Messages */}
						<div
							style={{
								flex: 1,
								overflowY: 'auto',
								padding: '20px 24px',
								display: 'flex',
								flexDirection: 'column',
								gap: '8px',
							}}
						>
							{messages.map((msg, index) => {
								const isMine =
									String(msg.sender_id) === String(userId)
								return (
									<div
										key={msg.message_id || index}
										style={{
											display: 'flex',
											justifyContent: isMine
												? 'flex-end'
												: 'flex-start',
										}}
									>
										<div
											style={{
												maxWidth: '60%',
												padding: '10px 16px',
												borderRadius: isMine
													? '16px 16px 4px 16px'
													: '16px 16px 16px 4px',
												backgroundColor: isMine
													? '#485935'
													: '#CADBB7',
												color: isMine ? '#FFF' : '#2D3B1E',
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
													? new Date(
															msg.created_at,
														).toLocaleTimeString([], {
															hour: '2-digit',
															minute: '2-digit',
														})
													: ''}
											</div>
										</div>
									</div>
								)
							})}
							<div ref={messagesEndRef} />
						</div>

						{/* Input */}
						<div
							style={{
								padding: '16px 24px',
								borderTop: '1px solid #E5E7EB',
								backgroundColor: '#FFF',
								display: 'flex',
								gap: '12px',
							}}
						>
							<input
								type="text"
								value={inputMessage}
								onChange={(e) => setInputMessage(e.target.value)}
								onKeyDown={handleKeyPress}
								placeholder="Type a message..."
								style={{
									flex: 1,
									padding: '12px 18px',
									borderRadius: '24px',
									border: '1px solid #D1D5DB',
									outline: 'none',
									fontSize: '14px',
								}}
							/>
							<button
								onClick={handleSend}
								disabled={!inputMessage.trim()}
								style={{
									width: '44px',
									height: '44px',
									borderRadius: '50%',
									border: 'none',
									backgroundColor: inputMessage.trim()
										? '#485935'
										: '#D1D5DB',
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
					</>
				) : (
					<div
						style={{
							flex: 1,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'column',
							gap: '16px',
						}}
					>
						<i
							className="fa fa-comments"
							style={{ fontSize: '64px', color: '#CADBB7' }}
						></i>
						<div
							style={{
								fontSize: '18px',
								color: '#9CA3AF',
								fontWeight: '500',
							}}
						>
							Select a conversation to start chatting
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default AdminChat
