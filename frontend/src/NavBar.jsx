import { NavLink } from 'react-router'
import useAuth from './useAuth.js'

function NavBar({ onLogout, cartCount = 0 }) {
    const { isAdmin } = useAuth()

    const links = [
        { path: '/inventory', label: 'Books' },
        { path: '/books/add', label: 'Add Book', adminOnly: true },
        { path: '/magazines', label: 'Magazines' },
        { path: '/magazines/add', label: 'Add Magazine', adminOnly: true },
        { path: '/discmags', label: 'Disc Magazines' },
        { path: '/discmags/add', label: 'Add Disc Magazine', adminOnly: true },
        { path: '/tickets', label: 'Tickets' },
        { path: '/cart', label: `Cart (${cartCount})` }
    ]

    return (
        <div className="card">
            <div className="header">
                <h2>Products</h2>

                <button className="logout" onClick={onLogout}>
                    Logout
                </button>
            </div>

            <p>Role: {isAdmin ? 'ADMIN' : 'USER'}</p>

            <nav className="tabs">
                {links.filter(link => !link.adminOnly || isAdmin).map(link => (
                    <NavLink key={link.path} to={link.path}>
                        {({ isActive }) => (
                            <button
                                type="button"
                                className={isActive ? 'active' : ''}
                            >
                                {link.label}
                            </button>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}

export default NavBar
