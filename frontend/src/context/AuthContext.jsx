import React, { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true); // 👈 NUEVO
  const [modals, setModals] = useState({ login:false, register:false });

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (err) {
      console.error('Error cargando auth:', err);
    } finally {
      setLoading(false); // 👈 terminamos de cargar
    }
  }, []);

  useEffect(() => {
    user
      ? localStorage.setItem('auth_user', JSON.stringify(user))
      : localStorage.removeItem('auth_user');
  }, [user]);

  useEffect(() => {
    token
      ? localStorage.setItem('auth_token', token)
      : localStorage.removeItem('auth_token');
  }, [token]);

  const openLogin = () => setModals({ login:true, register:false });
  const openRegister = () => setModals({ login:false, register:true });
  const closeModals = () => setModals({ login:false, register:false });

  const login = (u, t) => { setUser(u); setToken(t); closeModals(); };
  const logout = () => { setUser(null); setToken(''); };

  return (
    <Ctx.Provider value={{
      user, token, loading, login, logout,
      modals, openLogin, openRegister, closeModals
    }}>
      {children}
    </Ctx.Provider>
  );
}
