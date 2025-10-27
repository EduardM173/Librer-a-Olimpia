import React from 'react';
import './ProfilePage.css';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  // Datos de dirección aún no ligados al backend (estático por ahora)
  const direccion = { zona: '—', calle: '—', numero: '—' };

  return (
    <div className="ProfilePage">
      <h1 className="perfil-title">Mi Perfil</h1>

      <div className="perfil-grid">
        {/* Columna izquierda: información personal */}
        <section className="perfil-card perfil-personal">
          <h2>Mi información personal</h2>
          <div className="perfil-row"><span>Nombre:</span> <strong>{user?.nombre || '—'}</strong></div>
          <div className="perfil-row"><span>Correo electrónico:</span> <strong>{user?.email || '—'}</strong></div>
          <div className="perfil-row"><span>Nro Celular:</span> <strong>—</strong></div>

          <h3>Dirección</h3>
          <div className="perfil-row"><span>Zona:</span> <strong>{direccion.zona}</strong></div>
          <div className="perfil-row"><span>Calle:</span> <strong>{direccion.calle}</strong></div>
          <div className="perfil-row"><span>Nro Vivienda:</span> <strong>{direccion.numero}</strong></div>
        </section>

        {/* Columna derecha: mis pedidos (estático por ahora) */}
        <section className="perfil-card perfil-pedidos">
          <h2>Mis pedidos</h2>

          <article className="pedido-item">
            <div className="pedido-thumb" />
            <div className="pedido-info">
              <div><strong>Nro Pedido</strong> #0001</div>
              <div>Estado: <strong>Entregado</strong></div>
              <div>Fecha: 2025-03-01 &nbsp;&nbsp; Total: <strong>Bs 120.00</strong></div>
              <button className="pedido-btn">Ver detalles</button>
            </div>
          </article>

          <article className="pedido-item">
            <div className="pedido-thumb" />
            <div className="pedido-info">
              <div><strong>Nro Pedido</strong> #0002</div>
              <div>Estado: <strong>Entregado</strong></div>
              <div>Fecha: 2025-03-10 &nbsp;&nbsp; Total: <strong>Bs 89.50</strong></div>
              <button className="pedido-btn">Ver detalles</button>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
