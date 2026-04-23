import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	messages: [],
	conversations: [],
	activeChatUserId: null,
	unreadCount: 0,
	unreadCounts: {}, // { [userId]: count }
	adminId: null,
	isOpen: false,
}

const chatReducer = createSlice({
	name: 'chatReducer',
	initialState,
	reducers: {
		setMessages: (state, action) => {
			state.messages = action.payload
		},
		addMessage: (state, action) => {
			// Avoid duplicates
			const exists = state.messages.find(
				(m) => String(m.message_id) === String(action.payload.message_id) ||
					   (m.message === action.payload.message && m.created_at === action.payload.created_at)
			)
			if (!exists) {
				state.messages.push(action.payload)
				if (!state.isOpen) {
					state.unreadCount += 1
				}
			}
		},
		setConversations: (state, action) => {
			state.conversations = action.payload
		},
		setActiveChatUserId: (state, action) => {
			state.activeChatUserId = action.payload
		},
		setUnreadCount: (state, action) => {
			state.unreadCount = action.payload
		},
		setUnreadCounts: (state, action) => {
			state.unreadCounts = action.payload
		},
		incrementUnread: (state, action) => {
			const id = String(action.payload)
			state.unreadCounts[id] = (state.unreadCounts[id] || 0) + 1
		},
		clearUnread: (state, action) => {
			const id = String(action.payload)
			delete state.unreadCounts[id]
		},
		setAdminId: (state, action) => {
			state.adminId = action.payload
		},
		toggleChat: (state) => {
			state.isOpen = !state.isOpen
			if (state.isOpen) {
				state.unreadCount = 0
			}
		},
		openChat: (state) => {
			state.isOpen = true
			state.unreadCount = 0
		},
		closeChat: (state) => {
			state.isOpen = false
		},
		clearMessages: (state) => {
			state.messages = []
		},
	},
})

export const {
	setMessages,
	addMessage,
	setConversations,
	setActiveChatUserId,
	setUnreadCount,
	setUnreadCounts,
	incrementUnread,
	clearUnread,
	setAdminId,
	toggleChat,
	openChat,
	closeChat,
	clearMessages,
} = chatReducer.actions

export default chatReducer.reducer
