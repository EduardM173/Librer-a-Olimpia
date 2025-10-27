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
    throw new Error('Error al cargar pedidos');
  }
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
                <p className="order-date">Fecha: {new Date(order.fecha).toLocaleDateString()}</p>
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