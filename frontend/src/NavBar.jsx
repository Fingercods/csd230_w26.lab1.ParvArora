import { NavLink } from 'react-router'

function NavBar({ onLogout, cartCount = 0 }) {
    const links = [
        { path: '/inventory', label: 'Books' },
        { path: '/books/add', label: 'Add Book' },
        { path: '/magazines', label: 'Magazines' },
        { path: '/magazines/add', label: 'Add Magazine' },
        { path: '/discmags', label: 'Disc Magazines' },
        { path: '/discmags/add', label: 'Add Disc Magazine' },
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

            <nav className="tabs">
                {links.map(link => (
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
