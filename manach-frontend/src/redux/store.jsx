import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userReducer/userReducer'
import danshboardReducer from './dashboardReducer/danshboardReducer'
import storeAReducer from './storeAReducer/storeAReducer'
import loadingReducer from './loadingReducer/loadingReducer'
import chatReducer from './chatReducer/chatReducer'

export const store = configureStore({
	reducer: {
		userReducer: userReducer,
		dashboardReducer: danshboardReducer,
		storeAReducer: storeAReducer,
		loadingReducer: loadingReducer,
		chatReducer: chatReducer,
	},
})
