import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const money = (n) => `Bs ${Number(n || 0).toFixed(2)}`;

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [cliente, setCliente] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !token) return;

      try {
        // 🔹 Obtener información del cliente
        const r1 = await fetch('http://localhost:3000/api/clientes/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const c = r1.ok ? await r1.json() : null;
        setCliente(c);

        // 🔹 Obtener pedidos del cliente autenticado
        const r2 = await fetch('http://localhost:3000/api/pedidos/mis-pedidos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const p = r2.ok ? await r2.json() : [];
        setPedidos(p);
      } catch (err) {
        console.error('Error cargando perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, token]);

  if (loading)
    return (
      <div className="ProfilePage">
        <p>Cargando perfil...</p>
      </div>
    );

  return (
    <div className="ProfilePage">
      <h1 className="perfil-title">Mi Perfil</h1>

      <div className="perfil-grid">
        {/* 🧍 Información personal */}
        <section className="perfil-card perfil-personal">
          <h2>Mi información personal</h2>
          <div className="perfil-row">
            <span>Nombre:</span> <strong>{cliente?.nombre || '—'}</strong>
          </div>
          <div className="perfil-row">
            <span>Correo electrónico:</span>{' '}
            <strong>{cliente?.email || '—'}</strong>
          </div>

          <h3>Dirección</h3>
          <div className="perfil-row">
            <span>Zona:</span> <strong>{cliente?.zona || '—'}</strong>
          </div>
          <div className="perfil-row">
            <span>Calle:</span> <strong>{cliente?.calle || '—'}</strong>
          </div>
          <div className="perfil-row">
            <span>N° Vivienda:</span>{' '}
            <strong>{cliente?.numero_casa || '—'}</strong>
          </div>

          <h3>Datos de Factura</h3>
          <div className="perfil-row">
            <span>NIT / CI:</span> <strong>{cliente?.nit_ci || '—'}</strong>
          </div>
        </section>

        {/* 📦 Pedidos del cliente */}
        <section className="perfil-card perfil-pedidos">
          <h2>Mis pedidos</h2>

          {pedidos.length === 0 ? (
            <p style={{ color: '#888' }}>No tienes pedidos registrados.</p>
          ) : (
            pedidos.map((p) => (
              <article key={p.id} className="pedido-item">
                <div className="pedido-thumb" />
                <div className="pedido-info">
                  <div>
                    <strong>Nro Pedido</strong> #{p.id}
                  </div>
                  <div>Estado: <strong>{p.estado}</strong></div>
                  <div>
                    Fecha: {p.fecha_pedido || '—'} &nbsp;&nbsp; Total:{' '}
                    <strong>{money(p.total_neto)}</strong>
                  </div>
                  <Link to={`/perfil/pedidos/${p.id}`} className="pedido-btn">
                    Ver detalles
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
