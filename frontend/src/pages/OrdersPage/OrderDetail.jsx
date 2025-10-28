import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ... (fetchOrderDetail permanece sin cambios)

const fetchOrderDetail = async (id, token) => {
  console.log("Token para detalle del pedido 👁❤👁:", token);
  if (!token) {
    throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
  }
  
  // Simula la llamada a la API: GET /api/orders/:id
  const response = await fetch(`http://localhost:3000/api/orders/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}` // Ejemplo de auth
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
  const { token } = useAuth();
  const { id } = useParams(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetail = async () => {
      
      if (!token) {
  console.log("No hay token disponible 🔒😭");
        setError('No se encontró el token de autenticación.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchOrderDetail(id,token);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadDetail();
  }, [id, token]); 

  if (loading) {
    return <h2 style={{textAlign: 'center', color: '#2c3e50'}}>Cargando detalle del pedido {id}... ⏳</h2>;
  }

  if (error) {
    return (
      <div style={{ 
            padding: '20px', 
            borderRadius: '8px', 
            backgroundColor: '#ffebeb', 
            color: '#c0392b', 
            textAlign: 'center' 
        }}>
        <h2>❌ Error: {error}</h2>
        <Link to="/perfil/pedidos" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>
            Volver a Mis Pedidos
        </Link>
      </div>
    );
  }
  
  // Función auxiliar para los colores de estado
  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'entregado': return '#27ae60'; // Verde
      case 'pendiente': return '#f39c12'; // Naranja
      case 'cancelado': return '#e74c3c'; // Rojo
      default: return '#34495e'; // Azul oscuro
    }
  };

  return (
    <div className="order-detail-container" style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
          color: '#e74c3c', // Rojo de tu tema
          borderBottom: '3px solid #fcdb03', // Separador amarillo
          paddingBottom: '10px',
          marginBottom: '25px',
          fontSize: '2.2rem',
          textAlign: 'center'
      }}>
          Detalle del Pedido #{order.id}
      </h1>
      
      <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
      }}>
          {/* Fila de Datos Principales */}
          <p style={{ margin: 0 }}>
              <strong style={{ color: '#2c3e50' }}>Fecha de Pedido:</strong> <br/>
              {new Date(order.fecha).toLocaleString()}
          </p>
          <p style={{ margin: 0 }}>
              <strong style={{ color: '#2c3e50' }}>Total Neto:</strong> <br/>
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#e74c3c' }}>Bs. {order.total}</span>
          </p>
          <p style={{ margin: 0 }}>
              <strong style={{ color: '#2c3e50' }}>Estado:</strong> <br/>
              <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.2rem',
                  color: getEstadoColor(order.estado)
              }}>
                  {order.estado}
              </span>
          </p>
          <p style={{ margin: 0 }}>
              <strong style={{ color: '#2c3e50' }}>Sucursal:</strong> <br/>
              {order.sucursal}
          </p>
          <p style={{ margin: 0 }}>
              <strong style={{ color: '#2c3e50' }}>Cliente:</strong> <br/>
              {order.cliente}
          </p>
      </div>

      <h2>Productos Comprados</h2>
      <table style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: '0 8px', // Espacio entre filas
          marginBottom: '30px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <th style={{ padding: '12px 15px', textAlign: 'left', borderRadius: '5px 0 0 5px' }}>Producto</th>
            <th style={{ padding: '12px 15px', textAlign: 'left' }}>SKU</th>
            <th style={{ padding: '12px 15px', textAlign: 'right' }}>Cantidad</th>
            <th style={{ padding: '12px 15px', textAlign: 'right' }}>Precio Unitario</th>
            <th style={{ padding: '12px 15px', textAlign: 'right', borderRadius: '0 5px 5px 0' }}>Importe</th>
          </tr>
        </thead>
        <tbody>
          {order.detalle.map((item, index) => (
            <tr key={index} style={{ 
                backgroundColor: index % 2 === 0 ? '#f7f7f7' : '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #eee' }}>{item.nombre}</td>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #eee' }}>{item.sku}</td>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{item.cantidad}</td>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #eee', textAlign: 'right' }}>Bs. {item.precio_unitario}</td>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>Bs. {item.importe}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Link to="/perfil/pedidos" className="back-link" style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 15px',
          backgroundColor: '#3498db', // Color azul para el botón de volver
          color: 'white',
          borderRadius: '5px',
          textDecoration: 'none',
          fontWeight: 'bold'
      }}>
          ← Volver a Mis Pedidos
      </Link>
    </div>
  );
};

export default OrderDetail;