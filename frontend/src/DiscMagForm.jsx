
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

function DiscMagForm({ token, onSaved, setMessage }) {
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
                const response = await fetch(`/api/rest/discmags/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error(`Could not load Disc Magazine (${response.status})`)
                }

                const item = await response.json()

                if (active) {
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
                if (active) setError(err.message)
            } finally {
                if (active) setLoadingItem(false)
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
            const response = await fetch(
                editing
                    ? `/api/rest/discmags/${id}`
                    : '/api/rest/discmags',
                {
                    method: editing ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                }
            )

            if (!response.ok) {
                throw new Error(`Could not save Disc Magazine (${response.status})`)
            }

            const savedItem = await response.json()

            onSaved(savedItem, editing)
            setMessage('Disc Magazine saved successfully!')
            navigate('/discmags')
        } catch (err) {
            setError(err.message)
            setMessage(err.message)
        } finally {
            setLoading(false)
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
