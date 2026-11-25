import api from './api.js'
import useAuth from './useAuth.js'

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

function DiscMagForm({ onSaved, setMessage }) {
    const { token, isAdmin } = useAuth()
    const isCurrent = () => localStorage.getItem('token') === token
    const { id } = useParams()
    const navigate = useNavigate()
    const editing = id !== undefined

    const [form, setForm] = useState({
        title: '',
        price: '',
        copies: '',
        orderQty: '',
        currentIssue: '',
        hasDisc: false
    })

    const [loading, setLoading] = useState(false)
    const [loadingItem, setLoadingItem] = useState(editing)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!editing) return

        let active = true

        async function loadDiscMag() {
            try {
                const response = await api.get(`/discmags/${id}`)
                const item = response.data

                if (active && localStorage.getItem('token') === token) {
                    setForm({
                        title: item.title ?? '',
                        price: String(item.price ?? ''),
                        copies: String(item.copies ?? ''),
                        orderQty: String(item.orderQty ?? ''),
                        currentIssue: item.currentIssue
                            ? String(item.currentIssue).slice(0, 16)
                            : '',
                        hasDisc: Boolean(item.hasDisc)
                    })
                }
            } catch (err) {
                if (active && localStorage.getItem('token') === token) {
                    setError(err.response?.status === 403
                        ? 'Permission denied.'
                        : err.message)
                }
            } finally {
                if (active && localStorage.getItem('token') === token) setLoadingItem(false)
            }
        }

        loadDiscMag()

        return () => {
            active = false
        }
    }, [editing, id, token])

    function updateForm(event) {
        const { name, value, type, checked } = event.target

        setForm(previous => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    async function saveDiscMag(event) {
        event.preventDefault()
        if (!isAdmin || !isCurrent() || loading) return
        setLoading(true)
        setError('')
        setMessage('')

        const payload = {
            title: form.title,
            price: Number(form.price),
            copies: Number(form.copies),
            orderQty: Number(form.orderQty),
            currentIssue: form.currentIssue
                ? `${form.currentIssue}:00`
                : null,
            hasDisc: form.hasDisc
        }

        try {
            const response = editing
                ? await api.put(`/discmags/${id}`, payload)
                : await api.post('/discmags', payload)

            if (!isCurrent()) return

            const savedItem = response.data

            onSaved(savedItem, editing)
            setMessage('Disc Magazine saved successfully!')
            navigate('/discmags')
        } catch (err) {
            if (isCurrent()) {
                const message = err.response?.status === 403
                    ? 'Permission denied. Administrator access is required.'
                    : err.message

                setError(message)
                setMessage(message)
            }
        } finally {
            if (isCurrent()) setLoading(false)
        }
    }

    if (loadingItem) {
        return <div className="card"><p>Loading Disc Magazine...</p></div>
    }

    if (editing && error && !form.title) {
        return <div className="card"><p>{error}</p></div>
    }

    return (
        <div className="card">
            <h2>{editing ? `Edit Disc Magazine #${id}` : 'Add New Disc Magazine'}</h2>

            <form onSubmit={saveDiscMag}>
                <div className="form-field">
                    <label htmlFor="title">Title</label>
                    <input id="title" name="title" type="text"
                           value={form.title} onChange={updateForm} required />
                </div>

                <div className="form-field">
                    <label htmlFor="price">Price</label>
                    <input id="price" name="price" type="number"
                           min="0" step="0.01" value={form.price}
                           onChange={updateForm} required />
                </div>

                <div className="form-field">
                    <label htmlFor="copies">Copies</label>
                    <input id="copies" name="copies" type="number"
                           min="0" step="1" value={form.copies}
                           onChange={updateForm} required />
                </div>

                <div className="form-field">
                    <label htmlFor="orderQty">Order Quantity</label>
                    <input id="orderQty" name="orderQty" type="number"
                           min="0" step="1" value={form.orderQty}
                           onChange={updateForm} required />
                </div>

                <div className="form-field">
                    <label htmlFor="currentIssue">Current Issue</label>
                    <input id="currentIssue" name="currentIssue"
                           type="datetime-local" value={form.currentIssue}
                           onChange={updateForm} />
                </div>

                <div className="form-field">
                    <label htmlFor="hasDisc">Includes Disc</label>
                    <input id="hasDisc" name="hasDisc" type="checkbox"
                           checked={form.hasDisc} onChange={updateForm} />
                </div>

                {error && <p className="message" role="alert">{error}</p>}

                <div className="actions">
                    <button disabled={loading} type="submit">
                        {loading ? 'Saving...' : editing ? 'Update Disc Magazine' : 'Add Disc Magazine'}
                    </button>

                    <button type="button" className="cancel"
                            onClick={() => navigate('/discmags')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default DiscMagForm
