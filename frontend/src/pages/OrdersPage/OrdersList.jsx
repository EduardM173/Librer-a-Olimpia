import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ✅ para obtener token real

// -------------------------------------------------------------
// 🔹 Función para obtener pedidos del cliente autenticado
// -------------------------------------------------------------
const fetchOrders = async (token) => {
  const response = await fetch('http://localhost:3000/api/pedidos/mis-pedidos', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) throw new Error('No autorizado. Inicia sesión.');
    if (response.status === 404) throw new Error('No se encontraron pedidos.');
    throw new Error('Error al cargar pedidos.');
  }

  return response.json();
};

// -------------------------------------------------------------
// 🔹 Componente principal
// -------------------------------------------------------------
export default function OrdersList() {
  const { token, user, openLogin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!token) {
        setError('Debes iniciar sesión para ver tus pedidos.');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchOrders(token);
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token]);

  // -------------------------------------------------------------
  // 🔹 Estados de carga y error
  // -------------------------------------------------------------
  if (loading) {
    return <div className="loading-state">Cargando tus pedidos... 🕓</div>;
  }

  if (error) {
    return (
      <div className="error-state" style={{ color: 'red' }}>
        {error === 'Debes iniciar sesión para ver tus pedidos.' ? (
          <button className="btn-login" onClick={openLogin}>Iniciar sesión</button>
        ) : (
          <>Error: {error}</>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 🔹 Render de pedidos
  // -------------------------------------------------------------
  return (
    <div className="profile-section-content">
      <h2 className="section-title">Mis Pedidos</h2>

      {orders.length === 0 ? (
        <p className="no-orders-message">Aún no has realizado ningún pedido.</p>
      ) : (
        <div className="orders-cards-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="card-header">
                <span className="order-nro">Pedido #{order.id}</span>
                <span className={`order-status status-${order.estado?.toLowerCase?.() || 'pendiente'}`}>
                  {order.estado}
                </span>
              </div>

              <div className="card-body">
                <p className="order-date">
                  Fecha: {new Date(order.fecha_pedido || order.fecha).toLocaleDateString()}
                </p>
                <p className="order-total">
                  Total: <strong>Bs {Number(order.total_neto || order.total).toFixed(2)}</strong>
                </p>
                <Link to={`/perfil/pedidos/${order.id}`} className="btn-details">
                  Ver detalles →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
