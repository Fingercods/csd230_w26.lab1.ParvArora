
import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router'
import './App.css'

const types = {
    books: {
        label: 'Books',
        singular: 'Book',
        fields: ['title', 'author', 'isbn', 'price', 'copies']
    },
    magazines: {
        label: 'Magazines',
        singular: 'Magazine',
        fields: ['title', 'price', 'copies', 'orderQty', 'currentIssue']
    },
    discmags: {
        label: 'Disc Magazines',
        singular: 'Disc Magazine',
        fields: ['title', 'price', 'copies', 'orderQty', 'currentIssue', 'hasDisc']
    },
    tickets: {
        label: 'Tickets',
        singular: 'Ticket',
        fields: ['description', 'price']
    }
}

const fieldNames = {
    title: 'Title',
    author: 'Author',
    isbn: 'ISBN',
    price: 'Price',
    copies: 'Copies',
    orderQty: 'Order Quantity',
    currentIssue: 'Current Issue',
    hasDisc: 'Includes Disc',
    description: 'Description'
}

function blankForm(type) {
    const result = {}

    types[type].fields.forEach(field => {
        result[field] = field === 'hasDisc' ? false : ''
    })

    return result
}

function displayValue(item, field) {
    if (field === 'price') {
        return `$${Number(item[field] ?? 0).toFixed(2)}`
    }

    if (field === 'hasDisc') {
        return item[field] ? 'Yes' : 'No'
    }

    if (field === 'currentIssue') {
        return item[field]
            ? String(item[field]).replace('T', ' ').slice(0, 16)
            : '-'
    }

    return item[field] ?? '-'
}

function ProductList({ type, token, setMessage }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        let active = true

        async function load() {
            setLoading(true)

            try {
                const response = await fetch(`/api/rest/${type}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error(`Could not load ${types[type].label} (${response.status})`)
                }

                const data = await response.json()

                if (active) {
                    setItems(data)
                }
            } catch (error) {
                if (active) {
                    setMessage(error.message)
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        load()

        return () => {
            active = false
        }
    }, [type, token, setMessage])

    async function refresh() {
        setLoading(true)
        setMessage('')

        try {
            const response = await fetch(`/api/rest/${type}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error(`Could not load ${types[type].label} (${response.status})`)
            }

            setItems(await response.json())
            setMessage(`${types[type].label} refreshed!`)
        } catch (error) {
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function deleteItem(id) {
        if (!window.confirm(`Are you sure you want to delete this ${types[type].singular}?`)) {
            return
        }

        setLoading(true)
        setMessage('')

        try {
            const response = await fetch(`/api/rest/${type}/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error(`Could not delete ${types[type].singular} (${response.status})`)
            }

            const listResponse = await fetch(`/api/rest/${type}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!listResponse.ok) {
                throw new Error(`Deleted, but could not refresh list (${listResponse.status})`)
            }

            setItems(await listResponse.json())
            setMessage(`${types[type].singular} deleted successfully!`)
        } catch (error) {
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <div className="header">
                <h2>{types[type].label}</h2>
                <div className="actions">
                    <button disabled={loading} onClick={refresh}>
                        Refresh
                    </button>
                    <button disabled={loading} onClick={() => navigate(`/${type}/add`)}>
                        Add {types[type].singular}
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                {types[type].fields.map(field => (
                                    <th key={field}>{fieldNames[field]}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    {types[type].fields.map(field => (
                                        <td key={field}>{displayValue(item, field)}</td>
                                    ))}
                                    <td>
                                        <div className="actions">
                                            <button onClick={() => navigate(`/${type}/edit/${item.id}`)}>
                                                Edit
                                            </button>
                                            <button className="delete" onClick={() => deleteItem(item.id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {items.length === 0 && (
                        <p>No {types[type].label.toLowerCase()} found.</p>
                    )}
                </>
            )}
        </div>
    )
}

function ProductForm({ type, token, setMessage }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const editing = id !== undefined
    const [form, setForm] = useState(() => blankForm(type))
    const [loading, setLoading] = useState(false)
    const [loadingItem, setLoadingItem] = useState(editing)
    const [loadError, setLoadError] = useState('')

    useEffect(() => {
        let active = true

        if (!editing) {
            return
        }

        async function loadItem() {
            setLoadingItem(true)
            setLoadError('')

            try {
                const response = await fetch(`/api/rest/${type}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error(`Could not load ${types[type].singular} (${response.status})`)
                }

                const items = await response.json()
                const item = items.find(value => String(value.id) === String(id))

                if (!item) {
                    throw new Error(`${types[type].singular} #${id} was not found`)
                }

                const updatedForm = {}

                types[type].fields.forEach(field => {
                    if (field === 'hasDisc') {
                        updatedForm[field] = Boolean(item[field])
                    } else if (field === 'currentIssue') {
                        updatedForm[field] = item[field]
                            ? String(item[field]).slice(0, 16)
                            : ''
                    } else {
                        updatedForm[field] = String(item[field] ?? '')
                    }
                })

                if (active) {
                    setForm(updatedForm)
                }
            } catch (error) {
                if (active) {
                    setLoadError(error.message)
                    setMessage(error.message)
                }
            } finally {
                if (active) {
                    setLoadingItem(false)
                }
            }
        }

        loadItem()

        return () => {
            active = false
        }
    }, [editing, id, type, token, setMessage])

    function updateForm(event) {
        const { name, value, type: inputType, checked } = event.target

        setForm(previous => ({
            ...previous,
            [name]: inputType === 'checkbox' ? checked : value
        }))
    }

    async function saveItem(event) {
        event.preventDefault()
        setLoading(true)
        setMessage('')

        const payload = { ...form }

        for (const field of ['price', 'copies', 'orderQty']) {
            if (field in payload) {
                payload[field] = Number(payload[field])
            }
        }

        if ('currentIssue' in payload) {
            payload.currentIssue = payload.currentIssue
                ? `${payload.currentIssue}:00`
                : null
        }

        const url = editing
            ? `/api/rest/${type}/${id}`
            : `/api/rest/${type}`

        try {
            const response = await fetch(url, {
                method: editing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error(`Could not save ${types[type].singular} (${response.status})`)
            }

            setMessage(`${types[type].singular} saved successfully!`)
            navigate(`/${type}`)
        } catch (error) {
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <h2>
                {editing
                    ? `Edit ${types[type].singular} #${id}`
                    : `Add New ${types[type].singular}`}
            </h2>

            {loadingItem ? (
                <p>Loading product...</p>
            ) : loadError ? (
                <p>{loadError}</p>
            ) : (
                <form onSubmit={saveItem}>
                    {types[type].fields.map(field => (
                        <div className="form-field" key={field}>
                            <label htmlFor={field}>{fieldNames[field]}</label>

                            {field === 'hasDisc' ? (
                                <input
                                    id={field}
                                    name={field}
                                    type="checkbox"
                                    checked={form[field]}
                                    onChange={updateForm}
                                />
                            ) : (
                                <input
                                    id={field}
                                    name={field}
                                    value={form[field]}
                                    onChange={updateForm}
                                    type={
                                        field === 'currentIssue'
                                            ? 'datetime-local'
                                            : ['price', 'copies', 'orderQty'].includes(field)
                                                ? 'number'
                                                : 'text'
                                    }
                                    step={
                                        field === 'price'
                                            ? '0.01'
                                            : ['copies', 'orderQty'].includes(field)
                                                ? '1'
                                                : undefined
                                    }
                                    min={
                                        ['price', 'copies', 'orderQty'].includes(field)
                                            ? '0'
                                            : undefined
                                    }
                                    required={field !== 'currentIssue'}
                                />
                            )}
                        </div>
                    ))}

                    <div className="actions">
                        <button disabled={loading}>
                            {loading
                                ? 'Saving...'
                                : editing
                                    ? `Update ${types[type].singular}`
                                    : `Add ${types[type].singular}`}
                        </button>

                        <button
                            type="button"
                            className="cancel"
                            onClick={() => navigate(`/${type}`)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

function App() {
    const [username, setUsername] = useState('user')
    const [password, setPassword] = useState('user')
    const [token, setToken] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    async function login(event) {
        event.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const response = await fetch('/api/rest/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })

            if (!response.ok) {
                throw new Error('Invalid username or password')
            }

            const data = await response.json()
            setToken(data.token)
            setMessage('Login successful!')
            navigate('/inventory')
        } catch (error) {
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    function logout() {
        setToken('')
        setPassword('')
        setMessage('Logged out successfully')
        navigate('/inventory')
    }

    return (
        <div className="container">
            <h1>Bookstore</h1>
            <p className="subtitle">CSD230 React + Spring Boot CRUD</p>

            {!token ? (
                <div className="card">
                    <h2>Login</h2>

                    <form onSubmit={login}>
                        <label>Username</label>
                        <input
                            value={username}
                            onChange={event => setUsername(event.target.value)}
                            required
                        />

                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            required
                        />

                        <button disabled={loading}>
                            {loading ? 'Please wait...' : 'Login'}
                        </button>
                    </form>
                </div>
            ) : (
                <>
                    <div className="card">
                        <div className="header">
                            <h2>Products</h2>
                            <button className="logout" onClick={logout}>
                                Logout
                            </button>
                        </div>

                        <p>Welcome, {username}!</p>

                        <div className="tabs">
                            {Object.keys(types).map(type => {
                                const path = type === 'books' ? '/inventory' : `/${type}`

                                return (
                                    <Link key={type} to={path}>
                                        <button
                                            className={
                                                location.pathname === path ||
                                                location.pathname.startsWith(`/${type}/`)
                                                    ? 'active'
                                                    : ''
                                            }
                                        >
                                            {types[type].label}
                                        </button>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    <Routes>
                        <Route path="/" element={<Navigate to="/inventory" replace />} />
                        <Route
                            path="/inventory"
                            element={<ProductList type="books" token={token} setMessage={setMessage} />}
                        />
                        <Route
                            path="/books/add"
                            element={<ProductForm type="books" token={token} setMessage={setMessage} />}
                        />
                        <Route
                            path="/books/edit/:id"
                            element={<ProductForm type="books" token={token} setMessage={setMessage} />}
                        />

                        {['magazines', 'discmags', 'tickets'].map(type => (
                            <Route
                                key={type}
                                path={`/${type}`}
                                element={<ProductList type={type} token={token} setMessage={setMessage} />}
                            />
                        ))}

                        {['magazines', 'discmags', 'tickets'].map(type => (
                            <Route
                                key={`${type}-add`}
                                path={`/${type}/add`}
                                element={<ProductForm type={type} token={token} setMessage={setMessage} />}
                            />
                        ))}

                        {['magazines', 'discmags', 'tickets'].map(type => (
                            <Route
                                key={`${type}-edit`}
                                path={`/${type}/edit/:id`}
                                element={<ProductForm type={type} token={token} setMessage={setMessage} />}
                            />
                        ))}

                        <Route path="*" element={<Navigate to="/inventory" replace />} />
                    </Routes>
                </>
            )}

            {message && (
                <p className="message" role="status">
                    {message}
                </p>
            )}
        </div>
    )
}

export default App
