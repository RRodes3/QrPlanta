import { createContext, useContext, useEffect, useState } from 'react';
import { getMeRequest, loginRequest } from '../api/auth.api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const data = await loginRequest(credentials);

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const verifySession = async () => {
      try {
        const storedToken = localStorage.getItem('token');

        if (!storedToken) {
          setLoading(false);
          return;
        }

        const data = await getMeRequest();
        setUser(data.user);
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);