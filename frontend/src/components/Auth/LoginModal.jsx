import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function LoginModal() {
  const { modals, closeModals, openRegister, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const r = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const j = await r.json();
      if (!r.ok) {
        setErr(j.message || 'Credenciales inválidas.');
        return;
      }
      login(j.user, j.token); // guarda en contexto + localStorage y cierra modal
    } catch {
      setErr('Error de conexión con el servidor.');
    }
  }

  return (
    <Modal open={modals.login} onClose={closeModals}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Correo electrónico</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Contraseña</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>

        {err && <div style={{color:'#e74c3c', fontSize:14, textAlign:'center'}}>{err}</div>}

        <div className="modal-actions">
          <button className="modal-btn" type="submit">Iniciar Sesión</button>
        </div>

        <p className="modal-note">
          ¿No tienes una cuenta?{' '}
          <button type="button" className="modal-link" onClick={openRegister}>Registrarse</button>
        </p>
      </form>
    </Modal>
  );
}
