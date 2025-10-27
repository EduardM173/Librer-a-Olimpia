import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- (Función fetchOrders: Mantenemos la misma lógica de la API) ---
const fetchOrders = async () => {
  // Simula la llamada a la API: GET /api/orders
  const response = await fetch('/api/orders', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}` 
    }
  });
  if (!response.ok) {
    // Intenta leer el body como texto si el error es 500 y no hay JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        // Si el servidor devolvió un error JSON (ej: { error: 'orders_failed' })
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar pedidos (JSON).');
    } else {
        // Si el servidor devolvió HTML (ej: la página de error 500/404)
        throw new Error(`Error ${response.status}: El servidor devolvió HTML inesperado. Revisa la consola del BACKEND.`);
    }
  }
  // Si todo está OK, procede a leer JSON
  return response.json();
};
// -------------------------------------------------------------------


const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Lógica para cargar los pedidos
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  if (loading) {
    return <div className="loading-state">Cargando mis pedidos... 🗿</div>;
  }

  if (error) {
    return <div className="error-state" style={{ color: 'red' }}>Error: {error}</div>;
  }

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
                {/* Nro Pedido  */}
                <span className="order-nro">Nro Pedido: **{order.id}**</span>
                {/* Estado: Entregado [cite: 16] */}
                <span className={`order-status status-${order.estado.toLowerCase()}`}>
                  Estado: **{order.estado}**
                </span>
              </div>

              <div className="card-body">
                {/* Fecha [cite: 17] */}
                <p className="order-date">Fecha: **{order.fecha}**</p>
                {/* Total [cite: 18] */}
                <p className="order-total">Total: **Bs. {order.total}**</p>
                {/* Ver detalles [cite: 19] */}
                <Link 
                  to={`/perfil/pedidos/${order.id}`} 
                  className="btn-details"
                >
                  Ver detalles →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersList;