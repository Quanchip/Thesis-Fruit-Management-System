import React, { useEffect } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import NeedHelps from './needHelps/needHelps'
import { useDispatch, useSelector } from 'react-redux'
import { logOutAction } from '../redux/userReducer/userReducer'
import { getInfor } from '../redux/userReducer/userThunk'
import { setUnreadCounts } from '../redux/chatReducer/chatReducer'
import axios from 'axios'

// NavItem
const NavItemCustomer = [
	{
		name: 'Home',
		link: '/customer/home',
		icon: 'home',
	},
	{
		name: 'Store',
		link: '/customer/store',
		icon: 'shopping-cart',
	},
	{
		name: 'Order',
		link: '/customer/order',
		icon: 'clipboard-list',
	},
	{
		name: 'Checkout',
		link: '/customer/check-out',
		icon: 'cash-register',
	},
	{
		name: 'Setting',
		link: '/customer/setting',
		icon: 'cog',
	},
	{
		name: 'Logout',
		link: '/',
		icon: 'sign-out-alt',
	},
]
const NavItemAdminn = [
	{
		name: 'Home',
		link: '/admin/home',
		icon: 'home',
	},
	{
		name: 'Store',
		link: '/admin/store',
		icon: 'shopping-cart',
	},
	{
		name: 'Warehouse',
		link: '/admin/warehouse',
		icon: 'warehouse',
	},
	{
		name: 'Dashboard',
		link: '/admin/dashboard',
		icon: 'tag',
	},
	{
		name: 'Chat',
		link: '/admin/chat',
		icon: 'comments',
	},
	{
		name: 'Setting',
		link: '/admin/setting',
		icon: 'cog',
	},
	{
		name: 'Logout',
		link: '/',
		icon: 'sign-out-alt',
	},
]

const Menu = () => {
	const [menu, setMenu] = useState([])
	const location = useLocation()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { roleName, userId, inforUser } = useSelector(
		(state) => state.userReducer,
	)
	const { unreadCounts } = useSelector((state) => state.chatReducer)

	// Total unread across all conversations
	const totalUnread = Object.values(unreadCounts || {}).reduce(
		(sum, c) => sum + c,
		0,
	)

	useEffect(() => {
		if (roleName === 'admin') {
			setMenu(NavItemAdminn)
		} else if (roleName == 'customer') {
			setMenu(NavItemCustomer)
		}
		dispatch(getInfor(userId))
	}, [])

	// Fetch unread counts for admin sidebar badge
	useEffect(() => {
		if (roleName === 'admin' && userId) {
			axios
				.get(`http://localhost:8080/chat/conversations?adminId=${userId}`)
				.then((res) => {
					const convs = res.data.content
					const counts = {}
					convs.forEach((conv) => {
						if (conv.unread_count > 0) {
							counts[String(conv.user_id)] = conv.unread_count
						}
					})
					dispatch(setUnreadCounts(counts))
				})
				.catch(() => { })
		}
	}, [roleName, userId, dispatch])

	const handleLogoutClick = () => {
		// Navigate to "About Us" page after logout
		dispatch(logOutAction())
		navigate('/about-us')
	}

	return (
		<div className="sticky flex h-screen w-full flex-col items-start justify-between bg-green_dark1">
			<div className="flex items-center p-2">
				<img
					src="/src/assets/sumbol.png"
					className="h-[5rem] w-[5rem] rounded-full bg-offwhite"
					alt=""
				/>
				<div className="ml-4">
					<span className="text-[1.875rem] font-extrabold text-offwhite">
						Manach
					</span>
				</div>
			</div>
			{inforUser ? (
				<div className="flex space-x-4 px-4">
					<img
						src="/src/assets/userAvtG.jpg"
						className="h-[3rem] w-[3rem] rounded-full"
						alt=""
					/>
					<div className="h-fit text-offwhite opacity-70">
						<div className="text-[1.25rem]">{inforUser.full_name}</div>
						<span className="text-[0.7rem]">{roleName}</span>
					</div>
				</div>
			) : null}
			<div className="w-full">
				{menu.map((item, index) =>
					item.name === 'Logout' ? (
						<Link
							key={index}
							to={item.link}
							onClick={handleLogoutClick}
							className={`block w-full space-x-4 p-4 ${location.pathname === item.link
								? 'no-hover text-white bg-green_light3'
								: 'text-offwhite'
								} ${location.pathname === item.link
									? ''
									: 'hover:bg-green_light3 hover:text-green_dark1'
								}`}
							style={{ transition: 'ease-in-out 0.3s' }}
						>
							<i className={`fa fa-${item.icon} mr-4`}></i>
							{item.name}
						</Link>
					) : (
						<Link
							key={index}
							to={item.link}
							className={`block w-full space-x-4 p-4 ${location.pathname === item.link
								? 'no-hover text-white bg-green_light3'
								: 'text-offwhite'
								} ${location.pathname === item.link
									? ''
									: 'hover:bg-green_light3 hover:text-green_dark1'
								}`}
							style={{
								transition: 'ease-in-out 0.3s',
								position: 'relative',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<i className={`fa fa-${item.icon} mr-4`}></i>
							{item.name}
							{item.name === 'Chat' && totalUnread > 0 && (
								<span
									style={{
										marginLeft: 'auto',
										backgroundColor: '#EF4444',
										color: '#FFF',
										fontSize: '11px',
										fontWeight: '700',
										minWidth: '20px',
										height: '20px',
										borderRadius: '10px',
										display: 'inline-flex',
										alignItems: 'center',
										justifyContent: 'center',
										padding: '0 6px',
									}}
								>
									{totalUnread > 99 ? '99+' : totalUnread}
								</span>
							)}
						</Link>
					),
				)}
			</div>
			<NeedHelps />
		</div>
	)
}

export default Menu
