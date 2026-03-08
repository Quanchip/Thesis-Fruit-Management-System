import { createAsyncThunk } from '@reduxjs/toolkit'
import { message } from 'antd'
import { userService } from '../../service/userService'

export const userThunk = createAsyncThunk(
	'userReducer/loginThunk',
	async (payload, { rejectWithValue }) => {
		try {
			const data = await userService.postLogin(payload)
			message.success('Login succes')

			return data.data.content
		} catch (error) {
			message.error('Login fail')
			return rejectWithValue(error?.response?.data?.message || 'Login fail')
		}
	},
)
export const getInfor = createAsyncThunk(
	'userReducer/getInfor',
	async (payload, { rejectWithValue }) => {
		try {
			const data = await userService.getInfor(payload)
			return data
		} catch (error) {
			console.log('error:', error)
			return rejectWithValue(error?.response?.data?.message || 'Get info fail')
		}
	},
)
export const editProfile = createAsyncThunk(
	'userReducer/editProfile',
	async (payload, { rejectWithValue }) => {
		try {
			const data = await userService.editProfile(payload.id, payload.infor)
			message.success('Change success')
			return data
		} catch (error) {
			console.log('error:', error)
			return rejectWithValue(error?.response?.data?.message || 'Edit profile fail')
		}
	},
)
export const postSignUp = createAsyncThunk(
	'userReducer/signup',
	async (payload, { rejectWithValue }) => {
		try {
			const data = await userService.postSignUp(payload)
			message.success('Create Account Success')
			return data
		} catch (error) {
			console.log('error:', error)
			message.error('Create Account Fail')
			return rejectWithValue(error?.response?.data?.message || 'Create Account Fail')
		}
	},
)
