import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function RegisterModal() {
  const { modals, closeModals, openLogin, login } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');

    // --- Validaciones básicas en el cliente ---
    if (nombre.trim().length < 3) {
      setErr('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr('Correo electrónico inválido.');
      return;
    }

    if (password !== repeat) {
      setErr('Las contraseñas no coinciden.');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setErr('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

    try {
      const r = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });

      const j = await r.json();
      if (!r.ok) {
        setErr(j.message || 'Error al registrarse.');
        return;
      }

      // Iniciar sesión automáticamente tras registrarse
      login(j.user, j.token);
    } catch (error) {
      setErr('Error de conexión con el servidor.');
    }
  }

  return (
    <Modal open={modals.register} onClose={closeModals}>
      <h2>Crear una cuenta</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Tu nombre completo"
          />
        </div>
        <div>
          <label>Correo electrónico</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="ejemplo@correo.com"
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            placeholder="********"
          />
        </div>
        <div>
          <label>Repetir contraseña</label>
          <input
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            type="password"
            required
            placeholder="********"
          />
        </div>

        {err && <div style={{ color: '#e74c3c', fontSize: 14, textAlign: 'center' }}>{err}</div>}

        <div className="modal-actions">
          <button className="modal-btn" type="submit">Registrarse</button>
        </div>

        <p className="modal-note">
          ¿Ya tienes cuenta?{' '}
          <button type="button" className="modal-link" onClick={openLogin}>
            Iniciar Sesión
          </button>
        </p>
      </form>
    </Modal>
  );
}
