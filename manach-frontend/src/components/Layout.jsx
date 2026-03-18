import { useLocation } from 'react-router-dom'
import Menu from './Menu'
import ChatBubble from './Chat/ChatBubble'

const notMenu = [
	'/auth/login',
	'/auth/signup',
	'/auth',
	'/auth/welcome',
	'/about-us',
	'/',
	' ',
]

function Layout({ children }) {
	const location = useLocation()

	const isAuthPage = notMenu.includes(location.pathname)
	const renderMenu = !isAuthPage
	const isCustomerPage = location.pathname.startsWith('/customer')

	const renderFlexDiv = !isAuthPage ? (
		<div className="flex">
			<div className="fixed w-[20%]">{renderMenu && <Menu />}</div>
			<div className="ml-[20%] w-[80%]">{children}</div>
			{isCustomerPage && <ChatBubble />}
		</div>
	) : (
		children
	)

	return renderFlexDiv
}

export default Layout
