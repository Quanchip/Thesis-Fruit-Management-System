export const userLocal = {
	safeParse: (value) => {
		if (
			value === null ||
			value === undefined ||
			value === 'undefined' ||
			value === 'null' ||
			value === ''
		) {
			return null
		}

		try {
			return JSON.parse(value)
		} catch {
			return null
		}
	},

	//input item to local storage
	setInfor: (inforUser) => {
		if (inforUser === undefined) return
		let json = JSON.stringify(inforUser)
		localStorage.setItem('inforUser', json)
	},
	setId: (inforUser) => {
		if (inforUser === undefined || inforUser === null) {
			localStorage.removeItem('userId')
			return
		}
		let json = JSON.stringify(inforUser)
		localStorage.setItem('userId', json)
	},
	setRoleName: (data) => {
		if (data === undefined || data === null) {
			localStorage.removeItem('userRole')
			return
		}
		let inforUser
		if (data == 1) inforUser = 'admin'
		else inforUser = 'customer'
		let json = JSON.stringify(inforUser)
		localStorage.setItem('userRole', json)
	},
	setDetail: (data) => {
		let json = JSON.stringify(data)
		localStorage.setItem('detail', json)
	},

	//get information from local storage
	getInfor: () => {
		let json = localStorage.getItem('inforUser')
		return userLocal.safeParse(json)
	},
	getRoleName: () => {
		let json = localStorage.getItem('userRole')
		return userLocal.safeParse(json)
	},
	getUserId: () => {
		let json = localStorage.getItem('userId')
		return userLocal.safeParse(json)
	},

	//delete item in local storage
	delete: () => {
		// localStorage.removeItem('inforUser')
		localStorage.removeItem('userRole')
		localStorage.removeItem('userId')
	},
}
