import { useEffect, useState } from 'react'
import { cartLocal } from '../../../../service/cartLocal'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { postOrder } from '../../../../redux/cartReducer/cartThunk'

const CusCheckOut = () => {
	const [list, setList] = useState(cartLocal.get('cart') || [])
	const [isSuccess, setIsSuccess] = useState(false)
	const [deliveryInfo, setDeliveryInfo] = useState({
		delivery_name: '',
		delivery_phone: '',
		delivery_address: '',
	})

	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { userId, inforUser } = useSelector((state) => state.userReducer)

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

	const orderProduct = async () => {
		if (!deliveryInfo.delivery_name || !deliveryInfo.delivery_phone || !deliveryInfo.delivery_address) {
			message.warning('Please fill in all delivery information fields')
			return
		}

		if (list.length === 0) {
			message.warning('Your cart is empty')
			return
		}

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
		}
		const order = {
			data: data,
			user_id: userId,
		}

		try {
			// dispatch returns a promise when using createAsyncThunk + rejectWithValue
			const resultAction = await dispatch(postOrder(order)).unwrap()
			// If we reach here, unwrap succeeded
			cartLocal.delete()
			setIsSuccess(true)
		} catch (err) {
			// Error is already handled/messaged in thunk, but we can catch here if needed
			console.log("Order failed", err)
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
							className="rounded-xl bg-orange px-6 py-3 text-offwhite font-semibold shadow-md hover:bg-orange/90 transition-colors"
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

						<hr className="border-grey my-4" />
						<div className="flex justify-between text-[1.25rem] font-bold text-green_dark1 mb-6">
							<div>Total</div>
							<span className="text-orange">${calTotalCost().toFixed(2)}</span>
						</div>

						<button
							onClick={orderProduct}
							className="w-full rounded-xl bg-green_dark1 py-3.5 text-offwhite text-[1.125rem] font-bold shadow-md hover:bg-green_dark1/90 transition-all active:scale-[0.98]"
						>
							Confirm Order
						</button>
					</div>

				</div>
			</div>
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
