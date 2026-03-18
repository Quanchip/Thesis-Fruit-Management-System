import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleChat } from '../../redux/chatReducer/chatReducer'
import ChatBox from './ChatBox'

const ChatBubble = () => {
    const dispatch = useDispatch()
    const { isOpen, unreadCount } = useSelector((state) => state.chatReducer)

    return (
        <>
            {isOpen && <ChatBox />}
            <button
                onClick={() => dispatch(toggleChat())}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '58px',
                    height: '58px',
                    borderRadius: '50%',
                    backgroundColor: isOpen ? '#CADBB7' : '#485935',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001,
                    transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                }}
            >
                <i
                    className={isOpen ? 'fa fa-times' : 'fa fa-comments'}
                    style={{
                        color: isOpen ? '#485935' : '#FFF',
                        fontSize: '24px',
                    }}
                ></i>
                {unreadCount > 0 && !isOpen && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            backgroundColor: '#EF4444',
                            color: '#FFF',
                            fontSize: '11px',
                            fontWeight: '700',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #FFF',
                        }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
        </>
    )
}

export default ChatBubble
