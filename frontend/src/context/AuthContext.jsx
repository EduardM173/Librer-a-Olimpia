import React, { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [modals, setModals] = useState({ login:false, register:false });

  useEffect(() => { user ? localStorage.setItem('auth_user', JSON.stringify(user)) : localStorage.removeItem('auth_user'); }, [user]);
  useEffect(() => { token ? localStorage.setItem('auth_token', token) : localStorage.removeItem('auth_token'); }, [token]);

  const openLogin = () => setModals({ login:true, register:false });
  const openRegister = () => setModals({ login:false, register:true });
  const closeModals = () => setModals({ login:false, register:false });

  const login = (u, t) => { setUser(u); setToken(t); closeModals(); };
  const logout = () => { setUser(null); setToken(''); };

  return (
    <Ctx.Provider value={{ user, token, login, logout, modals, openLogin, openRegister, closeModals }}>
      {children}
    </Ctx.Provider>
  );
}
