import { createContext, useContext, useState, useEffect } from 'react';
import { login, getMe, logoutUser } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await getMe();
        setUser(data.user || data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (email, password) => {
    const data = await login(email, password);
    const resolvedUser = data.user || data;
    setUser(resolvedUser);
    return data;
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);