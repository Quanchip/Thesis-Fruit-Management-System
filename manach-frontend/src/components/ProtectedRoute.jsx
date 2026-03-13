import { Navigate, Outlet } from 'react-router-dom'
import { userLocal } from '../service/userLocal'

/**
 * ProtectedRoute - Guards routes based on authentication and role.
 *
 * @param {string[]} allowedRoles - Array of roles that can access this route, e.g. ['admin'] or ['customer']
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const userId = userLocal.getUserId()
    const roleName = userLocal.getRoleName()

    // Not logged in → redirect to login
    if (!userId) {
        return <Navigate to="/auth/login" replace />
    }

    // Logged in but wrong role → redirect to their own home
    if (allowedRoles && !allowedRoles.includes(roleName)) {
        if (roleName === 'admin') {
            return <Navigate to="/admin/home" replace />
        }
        return <Navigate to="/customer/home" replace />
    }

    // All good → render the child routes
    return <Outlet />
}

export default ProtectedRoute
