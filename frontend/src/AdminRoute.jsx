import { Navigate } from 'react-router'
import useAuth from './useAuth.js'

export default function AdminRoute({ children }) {
    const { token, isAdmin } = useAuth()

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (!isAdmin) {
        return (
            <div className="card">
                <h2>Access Denied</h2>
                <p>Only administrators can access this page.</p>
            </div>
        )
    }

    return children
}
