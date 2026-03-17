import { createAsyncThunk } from '@reduxjs/toolkit'
import { cartService } from '../../service/cartService'
import { message } from 'antd'

export const cartThunk = createAsyncThunk(
	'cartReducer/cartThunk',
	async (payload) => {
		try {
			let data = await cartService.postOrder(
				payload.orderList,
				payload.supplierID,
				payload.roleName,
			)
			message.success('build success')
			return data.data.content
		} catch (error) {
			console.log('error:', error)
		}
	},
)
export const postOrder = createAsyncThunk(
	'cartReducer/postOrder',
	async (payload, { rejectWithValue }) => {
		try {
			console.log('payload:', payload.user_id)
			const data = await cartService.postOrder(payload.user_id, payload.data)
			message.success('Order placed successfully! Check your email.')
			return data.data.content
		} catch (error) {
			console.log('error:', error)
			message.error(error?.response?.data?.message || 'Failed to place order')
			return rejectWithValue(error?.response?.data)
		}
	},
)
