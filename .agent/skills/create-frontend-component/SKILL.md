---
name: create_frontend_component
description: Guidelines and instructions for creating robust and consistently styled React components in the Manach frontend to ensure UI consistency.
---

# UI & Styling Guidelines (Manach Design System)

When creating frontend components for the `manach-frontend` application, you MUST adhere to the following strict guidelines to match the project's visual identity:

## 1. Allowed Colors (Tailwind Custom Theme)
Always use the custom colors defined in `tailwind.config.js`. Avoid hard-coding hex values. The primary colors are based on a lush green, natural palette:
- **Backgrounds / Surfaces**: `bg-green_dark1`, `bg-green_light3`, `bg-offwhite`
- **Text**: `text-offwhite` (on dark backgrounds), `text-green_dark1` (on light backgrounds)
- **Accents**: `green_bright1`, `yellow_dark1`, `redpink_dark1`
- **Grays (Disabled/Secondary)**: `grey_light1`, `grey_dark1`

## 2. Component Layout & Tailwind Utility Classes
- **Flexbox & Grid**: Prefer `flex`, `items-center`, `justify-between` for alignment. 
- **Transitions**: When adding hover states, include smooth transitions (e.g., `transition: 'ease-in-out 0.3s'`).
- **Typography Sizes**: The `tailwind.config.js` defines custom typography (e.g., `h1`, `h2`, `paragraph`, `sm`). Alternatively, matching specific arbitrary sizes (e.g., `text-[1.875rem]` or `text-[1.25rem]`) is standard for large titles, combined with `font-extrabold`.
- **Hover Effects**: Common hover effects invert colors slightly, e.g., `hover:bg-green_light3 hover:text-green_dark1`.

## 3. Tech Stack Restrictions
- **React**: Use Arrow Function Components (`const MyComponent = () => { ... }`).
- **Icons**: Use **FontAwesome** classes for icons (`<i className="fa fa-shopping-cart"></i>`). Do not import separate SVG libraries unless specifically requested.
- **Complex UI**: Use **Ant Design (`antd`)** strictly for highly interactive elements like Dialogs/Modals, Select Dropdowns, or Data Tables.
- **Redux State**: Use `useSelector` and `useDispatch` from `react-redux` for tracking global store variables (e.g., `roleName`, `userId`, `inforUser`).
- **Routing**: Use `Link`, `useLocation`, and `useNavigate` from `react-router-dom`.

## 4. Scaffold Example

```jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

const ExampleComponent = ({ title }) => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { inforUser, roleName } = useSelector((state) => state.userReducer)
	const [localState, setLocalState] = useState(false)

	useEffect(() => {
		// Component mount logic
	}, [])

	return (
		<div className="flex w-full flex-col bg-offwhite p-4">
			<div className="flex items-center justify-between bg-green_dark1 p-4 rounded-md">
				<h1 className="text-[1.875rem] font-extrabold text-offwhite">
					{title}
				</h1>
				<button 
					className="px-4 py-2 text-offwhite bg-green_light1 hover:bg-green_light3 hover:text-green_dark1"
					style={{ transition: 'ease-in-out 0.3s' }}
					onClick={() => console.log('Action')}
				>
					<i className="fa fa-plus mr-2" />
					Action
				</button>
			</div>

			<div className="mt-4 text-grey_dark1">
				Welcome back, {inforUser?.full_name || 'Guest'}
			</div>
		</div>
	)
}

export default ExampleComponent
```

## 5. File Naming and Placement
- Components should be placed inside `src/components/` (often within feature specific folders if complex).
- Always name the file in PascalCase (e.g., `FeatureComponent.jsx`).
- Always use `export default ComponentName` at the bottom.
