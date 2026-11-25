import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import api from './api.js';
import useAuth from './useAuth.js';

export default function Login() {
    const { token, login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setPending(true);

        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });

            login(response.data.token);
            navigate('/inventory', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setPending(false);
        }
    }

    if (token) {
        return <Navigate to="/inventory" replace />;
    }

    return (
        <div className="card">
            <h2>Sign in</h2>

            {searchParams.get('reauth') === 'true' && (
                <p role="alert">
                    Your session has expired or is invalid. Please sign in again.
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <label>Username</label>
                <input
                    autoComplete="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />

                <button disabled={pending}>
                    {pending ? 'Signing in...' : 'Sign in'}
                </button>

                {error && <p role="alert">{error}</p>}
            </form>
        </div>
    );
}
