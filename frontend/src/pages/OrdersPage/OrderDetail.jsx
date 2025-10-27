import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Supón una función para obtener el detalle del pedido
const fetchOrderDetail = async (id) => {
  // Simula la llamada a la API: GET /api/orders/:id
  const response = await fetch(`/api/orders/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}` // Ejemplo de auth
    }
  });
  if (response.status === 404) {
    throw new Error('Pedido no encontrado o no autorizado.');
  }
  if (!response.ok) {
    throw new Error('Error al cargar el detalle del pedido.');
  }
  return response.json();
};

const OrderDetail = () => {
  // Obtiene el 'id' de la URL (ej: /perfil/pedidos/123 -> id = 123)
  const { id } = useParams(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        const data = await fetchOrderDetail(id);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]); // Se ejecuta cada vez que el ID del pedido en la URL cambia

  if (loading) {
    return <h2>Cargando detalle del pedido {id}... ⏳</h2>;
  }

  if (error) {
    return (
      <div style={{ color: 'red' }}>
        <h2>{error}</h2>
        <Link to="/perfil/pedidos">Volver a Mis Pedidos</Link>
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <h1>Detalle del Pedido #{order.id}</h1>
      
      <p><strong>Fecha de Pedido:</strong> {new Date(order.fecha).toLocaleString()}</p>
      <p><strong>Estado:</strong> <span className={`estado-${order.estado.toLowerCase()}`}>{order.estado}</span></p>
      <p><strong>Total Neto:</strong> Bs. {order.total}</p>
      <p><strong>Sucursal:</strong> {order.sucursal}</p>
      <p><strong>Cliente:</strong> {order.cliente}</p>

      <h2>Productos Comprados</h2>
      <table className="products-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {order.detalle.map((item, index) => (
            <tr key={index}>
              <td>{item.nombre}</td>
              <td>{item.sku}</td>
              <td>{item.cantidad}</td>
              <td>Bs. {item.precio_unitario}</td>
              <td>Bs. {item.importe}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Link to="/perfil/pedidos" className="back-link">← Volver a Mis Pedidos</Link>
    </div>
  );
};

export default OrderDetail;