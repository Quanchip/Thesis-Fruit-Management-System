import { useEffect, useState, useRef } from 'react'
import { cartLocal } from '../../../../service/cartLocal'
import { message } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { postOrder } from '../../../../redux/cartReducer/cartThunk'
import axios from 'axios'

const CusCheckOut = () => {
	const [list, setList] = useState(cartLocal.get('cart') || [])
	const [isSuccess, setIsSuccess] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isPaypalLoading, setIsPaypalLoading] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const SHIPPING_OPTIONS = [
		{ id: 'standard', label: 'Standard Delivery', desc: '3–5 business days', fee: 2, icon: 'fa-truck' },
		{ id: 'instant',  label: 'Instant Delivery',  desc: 'Same day delivery',  fee: 8, icon: 'fa-bolt' },
	]
	const [selectedShipping, setSelectedShipping] = useState('standard')
	const [deliveryInfo, setDeliveryInfo] = useState({
		delivery_name: '',
		delivery_phone: '',
		delivery_address: '',
	})
	// Keep a stable ref to deliveryInfo and list for the capture effect
	const deliveryInfoRef = useRef(deliveryInfo)
	const listRef = useRef(list)
	useEffect(() => { deliveryInfoRef.current = deliveryInfo }, [deliveryInfo])
	useEffect(() => { listRef.current = list }, [list])

	const navigate = useNavigate()
	const location = useLocation()
	const dispatch = useDispatch()
	const { userId, inforUser } = useSelector((state) => state.userReducer)

	// Auto-capture PayPal order when returning from PayPal approval page
	useEffect(() => {
		const params = new URLSearchParams(location.search)
		const paypalOrderId = params.get('paypalOrderId') || params.get('token') // PayPal uses 'token' as order ID param
		const status = params.get('paypal')

		if (status === 'cancelled') {
			message.warning('PayPal payment was cancelled.')
			navigate('/customer/check-out', { replace: true })
			return
		}

		if (paypalOrderId) {
			// Retrieve cart & delivery info from sessionStorage (set before redirect)
			const savedCart = JSON.parse(sessionStorage.getItem('paypal_cart') || '[]')
			const savedDelivery = JSON.parse(sessionStorage.getItem('paypal_delivery') || '{}')
			const savedUserId = sessionStorage.getItem('paypal_userId')

			// Guard: if cart already cleared, another effect run already handled this (React StrictMode double-invoke)
			if (savedCart.length === 0) {
				return
			}

			// Clear sessionStorage BEFORE the API call to prevent double-capture on re-render
			sessionStorage.removeItem('paypal_cart')
			sessionStorage.removeItem('paypal_delivery')
			sessionStorage.removeItem('paypal_userId')

			setIsPaypalLoading(true)
			axios
				.post(`http://localhost:8080/paypal/capture/${paypalOrderId}`, {
					products: savedCart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
					deliveryInfo: savedDelivery,
					userId: savedUserId,
					shippingMethod: sessionStorage.getItem('paypal_shipping') || 'standard',
				})
				.then(() => {
					sessionStorage.removeItem('paypal_shipping')
					cartLocal.delete()
					setIsSuccess(true)
					navigate('/customer/check-out', { replace: true })
				})
				.catch(() => {
					message.error('Failed to capture PayPal payment. Please contact support.')
				})
				.finally(() => setIsPaypalLoading(false))
		}
	}, [location.search])

	// Pre-fill user info if available
	useEffect(() => {
		if (inforUser) {
			setDeliveryInfo({
				delivery_name: inforUser.full_name || '',
				delivery_phone: inforUser.phone || '',
				delivery_address: inforUser.address || '',
			})
		}
	}, [inforUser])

	useEffect(() => {
		setList(cartLocal.get('cart') || [])
	}, [])

	const handleChangeQuantity = (id, instock, quantity, quantityChange) => {
		if (quantityChange < 0) {
			setList(cartLocal.changeQuantity(id, quantityChange))
		} else {
			if (quantity + quantityChange <= instock) {
				setList(cartLocal.changeQuantity(id, quantityChange))
			} else {
				message.error('item instock is not enough')
			}
		}
	}

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setDeliveryInfo((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const fetchData = () => {
		if (!list || list.length === 0) {
			return (
				<tr>
					<td colSpan="4" className="py-4 text-center">
						You dont have any products in your cart.
					</td>
				</tr>
			)
		}

		return list?.map((item, index) => {
			return (
				<tr key={item.product_id || index} className="border-b-[1px] border-green">
					<td className="py-4 pl-4 text-left">
						<div className="flex space-x-4">
							<img
								src={`${item.product_img}`}
								className="h-[3rem] w-[3rem]"
								alt=""
							/>
							<div>
								<div>{item.product_name}</div>
								<span>({item.product_condition})</span>
							</div>
						</div>
					</td>
					<td>
						<div className="flex justify-center space-x-4">
							<button
								className="rounded-full border px-2 border-offwhite hover:bg-green_light1 hover:text-green_dark1 transition-colors"
								onClick={() => {
									handleChangeQuantity(
										item.product_id,
										item.instockquantity,
										item.quantity,
										-1,
									)
								}}
							>
								-
							</button>
							<div>{item.quantity}</div>
							<button
								className="rounded-full border px-2 border-offwhite hover:bg-green_light1 hover:text-green_dark1 transition-colors"
								onClick={() => {
									handleChangeQuantity(
										item.product_id,
										item.instockquantity,
										item.quantity,
										1,
									)
								}}
							>
								+
							</button>
						</div>
					</td>
					<td>$ {item.selling_price}</td>
					<td>${item.quantity * item.selling_price}</td>
				</tr>
			)
		})
	}
	const calTotalCost = () => {
		let sum = 0
		for (let i = 0; i < list.length; i++) {
			sum += list[i].selling_price * list[i].quantity
		}
		return sum
	}
	const calFinalTotal = () => {
		const shippingFee = SHIPPING_OPTIONS.find((o) => o.id === selectedShipping)?.fee || 0
		return calTotalCost() + shippingFee
	}
	const showListCart = () => {
		return list.map((item) => {
			return (
				<tr key={item.product_id} className="my-4">
					<td className="text-left py-2">Item {item.product_id}</td>
					<td className="py-2">${item.selling_price}</td>
					<td className="py-2">{item.quantity}</td>
				</tr>
			)
		})
	}

	// Shared pre-flight validation
	const validateBeforeCheckout = () => {
		if (!deliveryInfo.delivery_name || !deliveryInfo.delivery_phone || !deliveryInfo.delivery_address) {
			message.warning('Please fill in all delivery information fields')
			return false
		}
		if (list.length === 0) {
			message.warning('Your cart is empty')
			return false
		}
		return true
	}

	const orderProduct = async () => {
		if (!validateBeforeCheckout()) return

		let orderList = []
		list.map((item) => {
			orderList.push({
				product_id: item.product_id,
				quantity: item.quantity,
			})
		})
		const data = {
			products: orderList,
			...deliveryInfo,
			shippingMethod: selectedShipping,
		}
		const order = {
			data: data,
			user_id: userId,
		}

		try {
			setIsModalOpen(false)
			setIsLoading(true)
			const resultAction = await dispatch(postOrder(order)).unwrap()
			cartLocal.delete()
			setIsSuccess(true)
		} catch (err) {
			console.log("Order failed", err)
		} finally {
			setIsLoading(false)
		}
	}

	// Handle Pay with PayPal button click
	const handlePayPal = async () => {
		if (!validateBeforeCheckout()) return

		const total = calTotalCost()
		sessionStorage.setItem('paypal_cart', JSON.stringify(list))
		sessionStorage.setItem('paypal_delivery', JSON.stringify(deliveryInfo))
		sessionStorage.setItem('paypal_userId', userId)
		sessionStorage.setItem('paypal_shipping', selectedShipping)

		try {
			setIsModalOpen(false)
			setIsPaypalLoading(true)
			const res = await axios.post('http://localhost:8080/paypal/create-order', {
				totalAmount: total,
				shippingMethod: selectedShipping,
			})
			const { approvalUrl } = res.data.content
			window.location.href = approvalUrl
		} catch {
			message.error('Failed to initiate PayPal payment.')
			setIsPaypalLoading(false)
		}
	}

	if (isSuccess) {
		return (
			<div className="m-8 flex flex-col items-center justify-center min-h-[60vh]">
				<div className="bg-green_light3 p-8 rounded-2xl shadow-lg text-center max-w-lg w-full">
					<div className="w-24 h-24 bg-green text-offwhite rounded-full flex items-center justify-center mx-auto mb-6">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h2 className="text-[2.5rem] font-extrabold text-green_dark1 mb-2">Order Placed!</h2>
					<p className="text-green_dark1 text-[1.1rem] mb-8">
						Your order has been successfully placed. We've sent a confirmation email with details to your registered email address.
					</p>

					<div className="space-x-4">
						<button
							onClick={() => navigate('/customer/home')}
							className="rounded-xl border-2 border-green_dark1 px-6 py-3 text-green_dark1 font-semibold hover:bg-green_dark1 hover:text-offwhite transition-colors"
						>
							Continue Shopping
						</button>
						<button
							onClick={() => navigate('/customer/order')}
							className="rounded-xl border-2 bg-orange px-6 py-3 text-green_dark1 font-semibold shadow-md hover:bg-orange/90 hover:text-offwhite transition-colors"
						>
							View Orders
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="m-8">
			{/* Title */}
			<div className="flex justify-between align-middle mb-4">
				<div className="text-[2.5rem] font-extrabold leading-[3.5rem] text-green_dark1">
					Checkout
				</div>
			</div>
			<div className="text-[1.5rem] font-[275] text-green_dark1 mb-8">
				Please review your cart and provide delivery details.
			</div>

			<div className="flex flex-col lg:flex-row gap-8">
				{/* Left: Cart Items */}
				<div className="w-full lg:w-[60%] flex flex-col rounded-2xl border border-grey px-8 py-6 bg-offwhite shadow-sm">
					<div className="flex justify-between items-end mb-4">
						<div className="text-[1.625rem] font-semibold text-green_dark1">Your Cart</div>
						<div className="text-green_dark1 opacity-80">{list.length} items</div>
					</div>
					<hr className="mb-6 border-grey" />
					<div className="flex-grow">
						<div className="overflow-x-auto">
							<table className="table w-full text-center">
								<thead>
									<tr className="text-center text-[1.1rem] font-semibold text-green_dark1 pb-4">
										<th className="text-left pb-4">Product Name</th>
										<th className="pb-4">Quantity (kg)</th>
										<th className="pb-4">Price</th>
										<th className="pb-4">Total</th>
									</tr>
								</thead>
								<tbody className="bg-green_dark1 text-offwhite [&>tr]:border-b [&>tr:last-child]:border-0 rounded-xl overflow-hidden shadow-inner">
									{fetchData()}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Right: Delivery Form & Order Summary */}
				<div className="w-full lg:w-[40%] flex flex-col gap-6">

					{/* Delivery Info Form */}
					<div className="rounded-2xl border border-grey px-8 py-6 bg-offwhite shadow-sm">
						<div className="text-[1.5rem] font-semibold text-green_dark1 mb-4">Delivery Information</div>
						<hr className="mb-6 border-grey" />

						<div className="space-y-4">
							<div>
								<label className="block text-green_dark1 text-sm font-semibold mb-1">Full Name</label>
								<input
									type="text"
									name="delivery_name"
									value={deliveryInfo.delivery_name}
									onChange={handleInputChange}
									className="w-full px-4 py-2 rounded-xl border border-grey bg-white focus:outline-none focus:border-green focus:ring-1 focus:ring-green"
									placeholder="e.g. John Doe"
								/>
							</div>
							<div>
								<label className="block text-green_dark1 text-sm font-semibold mb-1">Phone Number</label>
								<input
									type="tel"
									name="delivery_phone"
									value={deliveryInfo.delivery_phone}
									onChange={handleInputChange}
									className="w-full px-4 py-2 rounded-xl border border-grey bg-white focus:outline-none focus:border-green focus:ring-1 focus:ring-green"
									placeholder="e.g. 0912345678"
								/>
							</div>
							<div>
								<label className="block text-green_dark1 text-sm font-semibold mb-1">Delivery Address</label>
								<textarea
									name="delivery_address"
									value={deliveryInfo.delivery_address}
									onChange={handleInputChange}
									rows="3"
									className="w-full px-4 py-2 rounded-xl border border-grey bg-white focus:outline-none focus:border-green focus:ring-1 focus:ring-green resize-none"
									placeholder="123 Main St, Ward 1, District 1, HCMC"
								></textarea>
							</div>
						</div>
					</div>

					{/* Shipping Options */}
					<div className="rounded-2xl border border-grey px-8 py-6 bg-offwhite shadow-sm">
						<div className="text-[1.5rem] font-semibold text-green_dark1 mb-4">Shipping Method</div>
						<hr className="mb-4 border-grey" />
						<div className="space-y-3">
							{SHIPPING_OPTIONS.map((option) => {
								const isSelected = selectedShipping === option.id
								return (
									<button
										key={option.id}
										onClick={() => setSelectedShipping(option.id)}
										className={`w-full flex items-center gap-4 rounded-xl border-2 px-4 py-3 transition-all ${
											isSelected
												? 'border-green_dark1 bg-green_light3'
												: 'border-grey_light1 bg-white hover:border-green'
										}`}
									>
										<div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
											isSelected ? 'bg-green_dark1' : 'bg-grey_light1'
										}`}>
											<i className={`fa ${option.icon} text-sm ${
												isSelected ? 'text-offwhite' : 'text-grey_dark1'
											}`} />
										</div>
										<div className="text-left flex-1">
											<div className={`font-semibold ${ isSelected ? 'text-green_dark1' : 'text-grey_dark2' }`}>
												{option.label}
											</div>
											<div className="text-xs text-grey_dark1">{option.desc}</div>
										</div>
										<div className={`font-bold text-sm ${ isSelected ? 'text-green_dark1' : 'text-grey_dark2' }`}>
											+${option.fee.toFixed(2)}
										</div>
										{isSelected && <i className="fa fa-check-circle text-green_dark1 ml-1" />}
									</button>
								)
							})}
						</div>
					</div>

					{/* Order Summary */}
					<div className="rounded-2xl bg-grey_light1 px-8 py-6 shadow-sm">
						<div className="text-[1.5rem] font-semibold text-green_dark1 mb-4">Order Summary</div>
						<hr className="border-grey mb-4" />

						<div className="max-h-[200px] overflow-y-auto mb-4 custom-scrollbar pr-2">
							<table className="w-full text-center text-green_dark1 text-sm">
								<thead>
									<tr className="border-b border-grey/50">
										<th className="text-left font-semibold py-2">Item</th>
										<th className="font-semibold py-2">Price</th>
										<th className="font-semibold py-2 text-right">Qty</th>
									</tr>
								</thead>
								<tbody>{showListCart()}</tbody>
							</table>
						</div>

						<hr className="border-grey my-3" />
						{/* Subtotal row */}
						<div className="flex justify-between text-sm text-green_dark1 mb-1">
							<div>Subtotal</div>
							<span>${calTotalCost().toFixed(2)}</span>
						</div>
						{/* Shipping row */}
						<div className="flex justify-between text-sm text-green_dark1 mb-3">
							<div className="flex items-center gap-1">
								<i className={`fa ${ SHIPPING_OPTIONS.find(o => o.id === selectedShipping)?.icon } text-xs`} />
								{SHIPPING_OPTIONS.find(o => o.id === selectedShipping)?.label}
							</div>
							<span>+${(SHIPPING_OPTIONS.find(o => o.id === selectedShipping)?.fee || 0).toFixed(2)}</span>
						</div>
						<hr className="border-grey my-3" />
						{/* Final total */}
						<div className="flex justify-between text-[1.25rem] font-bold text-green_dark1 mb-6">
							<div>Total</div>
							<span className="text-orange">${calFinalTotal().toFixed(2)}</span>
						</div>

						{/* Single Checkout button */}
						<button
							onClick={() => {
								if (validateBeforeCheckout()) setIsModalOpen(true)
							}}
							disabled={isLoading || isPaypalLoading}
							className="w-full rounded-xl bg-green_dark1 py-3.5 text-offwhite text-[1.125rem] font-bold shadow-md hover:bg-green_dark1/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
						>
							{isLoading || isPaypalLoading ? (
								<><i className="fa fa-spinner fa-spin" /> Processing...</>
							) : (
								<><i className="fa fa-lock mr-2" /> Proceed to Payment</>
							)}
						</button>
					</div>

				</div>
			</div>

			{/* Payment Method Modal */}
			{isModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center"
					style={{ backgroundColor: 'rgba(44,55,33,0.55)', backdropFilter: 'blur(3px)' }}
					onClick={() => setIsModalOpen(false)}
				>
					<div
						className="bg-offwhite rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div className="bg-green_dark1 px-6 py-4 flex items-center justify-between">
							<div>
								<h2 className="text-offwhite text-[1.25rem] font-bold">Choose Payment Method</h2>
								<p className="text-green_light1 text-sm mt-0.5">Total: <span className="font-bold text-yellow_dark1">${calFinalTotal().toFixed(2)}</span></p>
							</div>
							<button onClick={() => setIsModalOpen(false)} className="text-green_light1 hover:text-offwhite text-xl transition-colors">
								<i className="fa fa-times" />
							</button>
						</div>

						{/* Payment Options */}
						<div className="p-6 space-y-3">

							{/* PayPal */}
							<button
								onClick={handlePayPal}
								disabled={isPaypalLoading}
								className="w-full flex items-center gap-4 rounded-xl border-2 border-transparent px-4 py-4 shadow-sm transition-all hover:border-yellow_dark1 hover:shadow-md active:scale-[0.98]"
								style={{ backgroundColor: '#FFF8E1' }}
							>
								<div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFC439' }}>
									<span style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '0.75rem', color: '#003087' }}>Pay</span>
								</div>
								<div className="text-left">
									<div className="font-bold text-green_dark2" style={{ color: '#003087' }}>
										<span style={{ fontStyle: 'italic' }}><span style={{ color: '#003087' }}>Pay</span><span style={{ color: '#009CDE' }}>Pal</span></span>
									</div>
									<div className="text-sm text-grey_dark1">Pay securely via PayPal Sandbox</div>
								</div>
								<div className="ml-auto"><i className="fa fa-chevron-right text-grey_dark1" /></div>
							</button>

							{/* COD */}
							<button
								onClick={orderProduct}
								className="w-full flex items-center gap-4 rounded-xl border-2 border-transparent px-4 py-4 bg-green_light3 shadow-sm transition-all hover:border-green hover:shadow-md active:scale-[0.98]"
							>
								<div className="w-12 h-12 rounded-full bg-green_dark1 flex items-center justify-center flex-shrink-0">
									<i className="fa fa-money-bill-wave text-offwhite" />
								</div>
								<div className="text-left">
									<div className="font-bold text-green_dark1">Cash on Delivery (COD)</div>
									<div className="text-sm text-grey_dark1">Pay when your order arrives</div>
								</div>
								<div className="ml-auto"><i className="fa fa-chevron-right text-grey_dark1" /></div>
							</button>

							{/* MoMo — Coming Soon */}
							<div className="w-full flex items-center gap-4 rounded-xl px-4 py-4 bg-grey_light1 opacity-60 cursor-not-allowed relative overflow-hidden">
								<div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D82D8B' }}>
									<i className="fa fa-mobile-alt text-offwhite text-lg" />
								</div>
								<div className="text-left">
									<div className="font-bold text-grey_dark2">MoMo E-Wallet</div>
									<div className="text-sm text-grey">Pay with MoMo</div>
								</div>
								<span className="ml-auto text-xs font-bold text-grey_dark1 bg-grey_light1 border border-grey rounded-full px-3 py-1">Coming Soon</span>
							</div>

							{/* Bank Transfer — Coming Soon */}
							<div className="w-full flex items-center gap-4 rounded-xl px-4 py-4 bg-grey_light1 opacity-60 cursor-not-allowed">
								<div className="w-12 h-12 rounded-full bg-green_dark2 flex items-center justify-center flex-shrink-0">
									<i className="fa fa-university text-offwhite" />
								</div>
								<div className="text-left">
									<div className="font-bold text-grey_dark2">Bank Transfer</div>
									<div className="text-sm text-grey">Direct bank payment</div>
								</div>
								<span className="ml-auto text-xs font-bold text-grey_dark1 bg-grey_light1 border border-grey rounded-full px-3 py-1">Coming Soon</span>
							</div>

							<p className="text-center text-xs text-grey mt-2"><i className="fa fa-lock mr-1" />Payments are secure and encrypted</p>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

// const data = [
// 	{
// 		id: 1123,
// 		img: '/src/assets/banana.png',
// 		name: 'banana',
// 		status: 'unfirm',
// 		quantity: 4,
// 		price: 5,
// 		instock: 12,
// 	},
// 	{
// 		id: 1423,
// 		img: '/src/assets/coconut.png',
// 		name: 'coconut',
// 		status: 'firm',
// 		quantity: 7,
// 		price: 7,
// 		instock: 15,
// 	},
// 	{
// 		id: 1231,
// 		img: '/src/assets/strawberry.png',
// 		name: 'strawberry',
// 		status: 'firm',
// 		quantity: 12,
// 		price: 9,
// 		instock: 27,
// 	},
// 	{
// 		id: 4122,
// 		img: '/src/assets/raspberry.png',
// 		name: 'raspberry',
// 		status: 'firm',
// 		quantity: 4,
// 		price: 11,
// 		instock: 12,
// 	},
// 	{
// 		id: 3123,
// 		img: '/src/assets/saurieng.png',
// 		name: 'durian',
// 		status: 'firm',
// 		quantity: 1,
// 		price: 3,
// 		instock: 11,
// 	},
// ]
// const data = []

export default CusCheckOut
