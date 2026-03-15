import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from token on mount
  useEffect(() => {
    const token = localStorage.getItem('moodquest_token');
    if (token) {
      api.get('/users/me')
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('moodquest_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (username, password) => {
    const { data } = await api.post('/auth/register', { username, password });
    localStorage.setItem('moodquest_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('moodquest_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('moodquest_token');
    setUser(null);
  };

  // Merge partial updates into user state
  const updateUser = useCallback((patch) => {
    setUser((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
