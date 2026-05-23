import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('litera_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('litera_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  function login(newToken, userData) {
    localStorage.setItem('litera_token', newToken);
    if (userData) localStorage.setItem('litera_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('litera_token');
    localStorage.removeItem('litera_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, setUser, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
