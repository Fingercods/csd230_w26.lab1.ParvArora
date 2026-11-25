import { useState } from 'react';
import { AuthContext } from './AuthContext.js';

export default function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    function login(nextToken) {
        if (typeof nextToken !== 'string' || !nextToken.trim()) {
            throw new Error('Login did not return a token.');
        }

        localStorage.setItem('token', nextToken);
        setToken(nextToken);
    }

    function logout() {
        localStorage.removeItem('token');
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
