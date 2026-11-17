
import { useState } from 'react'
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

function App() {
    const [username, setUsername] = useState('user')
    const [password, setPassword] = useState('user')
    const [token, setToken] = useState('')
    const [type, setType] = useState('books')
    const [items, setItems] = useState([])
    const [form, setForm] = useState(blankForm('books'))
    const [editingId, setEditingId] = useState(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    async function loadItems(selectedType = type, jwt = token) {
        const response = await fetch(`/api/rest/${selectedType}`, {
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })

        if (!response.ok) {
            throw new Error(`Could not load ${types[selectedType].label} (${response.status})`)
        }

        const data = await response.json()
        setItems(data)
    }

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

            await loadItems(type, data.token)
            setToken(data.token)
            setMessage('Login successful!')
        } catch (error) {
            setToken('')
            setItems([])
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function changeType(nextType) {
        if (nextType === type) return

        setLoading(true)
        setMessage('')

        try {
            await loadItems(nextType)
            setType(nextType)
            setForm(blankForm(nextType))
            setEditingId(null)
        } catch (error) {
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

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

        const url = editingId === null
            ? `/api/rest/${type}`
            : `/api/rest/${type}/${editingId}`

        const method = editingId === null ? 'POST' : 'PUT'

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error(`Could not save ${types[type].singular} (${response.status})`)
            }

            await loadItems()
            setForm(blankForm(type))
            setEditingId(null)
            setMessage(`${types[type].singular} saved successfully!`)
        } catch (error) {
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    function editItem(item) {
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

        setForm(updatedForm)
        setEditingId(item.id)
        setMessage(`Editing ${types[type].singular} #${item.id}`)
    }

    function cancelEdit() {
        setForm(blankForm(type))
        setEditingId(null)
        setMessage('')
    }

    async function deleteItem(id) {
        const confirmed = window.confirm(
            `Are you sure you want to delete this ${types[type].singular}?`
        )

        if (!confirmed) return

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

            await loadItems()

            if (editingId === id) {
                setForm(blankForm(type))
                setEditingId(null)
            }

            setMessage(`${types[type].singular} deleted successfully!`)
        } catch (error) {
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    function logout() {
        setToken('')
        setItems([])
        setPassword('')
        setType('books')
        setForm(blankForm('books'))
        setEditingId(null)
        setMessage('Logged out successfully')
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
                            {Object.keys(types).map(key => (
                                <button
                                    key={key}
                                    disabled={loading}
                                    className={type === key ? 'active' : ''}
                                    onClick={() => changeType(key)}
                                >
                                    {types[key].label}
                                </button>
                            ))}
                        </div>

                        <div className="header">
                            <h2>{types[type].label}</h2>

                            <button
                                disabled={loading}
                                onClick={async () => {
                                    setLoading(true)
                                    try {
                                        await loadItems()
                                        setMessage(`${types[type].label} refreshed!`)
                                    } catch (error) {
                                        setMessage(error.message)
                                    } finally {
                                        setLoading(false)
                                    }
                                }}
                            >
                                Refresh
                            </button>
                        </div>

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
                                            <td key={field}>
                                                {displayValue(item, field)}
                                            </td>
                                        ))}

                                        <td>
                                            <div className="actions">
                                                <button
                                                    disabled={loading}
                                                    onClick={() => editItem(item)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    disabled={loading}
                                                    className="delete"
                                                    onClick={() => deleteItem(item.id)}
                                                >
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
                    </div>

                    <div className="card">
                        <h2>
                            {editingId === null
                                ? `Add New ${types[type].singular}`
                                : `Edit ${types[type].singular}`}
                        </h2>

                        <form onSubmit={saveItem}>
                            {types[type].fields.map(field => (
                                <div className="form-field" key={field}>
                                    <label htmlFor={field}>
                                        {fieldNames[field]}
                                    </label>

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

                            <button disabled={loading}>
                                {loading
                                    ? 'Saving...'
                                    : editingId === null
                                        ? `Add ${types[type].singular}`
                                        : `Update ${types[type].singular}`}
                            </button>

                            {editingId !== null && (
                                <button
                                    type="button"
                                    className="cancel"
                                    onClick={cancelEdit}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </form>
                    </div>
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
