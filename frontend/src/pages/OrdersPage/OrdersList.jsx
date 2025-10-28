import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const OrdersList = () => {
  // ... (estados y lógica sin cambios)

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const loadOrders = async () => {
      
      console.log("Token obtenido 🥵🥵:", token);

      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        const response = await fetch('http://localhost:3000/api/orders', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          let errorMessage = `Error ${response.status}`;

          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            errorMessage += ": Respuesta inesperada del servidor (HTML).";
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setOrders(data || []); 
      } catch (err) {
        console.error("Error al cargar pedidos:", err);
        setError(err.message || "Error desconocido al cargar los pedidos.");
      } finally {
        setLoading(false); 
      }
    };

    loadOrders();
  }, [token]); 

  // Renderizado condicional... (sin cambios aquí)

  if (loading) {
    return <div className="loading-state" style={{textAlign: 'center', padding: '20px'}}>Cargando mis pedidos... 🗿</div>;
  }

  if (error) {
    return (
      <div 
        className="profile-section-content"
        style={{
          backgroundColor: '#e74c3c', // Rojo como el contenedor principal
          borderRadius: '15px',
          padding: '20px',
          maxWidth: '400px', // Ancho máximo para la imagen
          margin: '20px auto', // Centrar
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
        }}
      >
        <h2 style={{
          fontFamily: 'cursive', // 🚨 ESTILO DE FUENTE CURSIVA
          fontSize: '2.5rem',
          color: '#fff',
          textAlign: 'center',
          marginBottom: '20px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
        }}>Mis pedidos</h2>
        <div className="error-state" style={{ 
          color: '#fff', 
          backgroundColor: 'rgba(0,0,0,0.2)',
          padding: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          Error: {error}
          <br />
          <small>Revisa la consola para más detalles.</small>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="profile-section-content"
      style={{
        backgroundColor: '#e74c3c', // Fondo rojo del contenedor principal
        borderRadius: '15px',
        padding: '20px',
        maxWidth: '400px', // Ancho máximo para que se parezca a la imagen
        margin: '20px auto', // Centrar
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' // Sombra para realzar el contenedor
      }}
    >
      {/* 🚨 CAMBIO DE ESTILO AQUÍ */}
      <h2 style={{
        fontFamily: 'Poppins', // Usamos 'cursive' como fallback genérico para fuentes script
        fontSize: '2.5rem',
        color: '#fff',
        textAlign: 'center',
        marginBottom: '20px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
      }}>Mis pedidos</h2>

      {orders.length === 0 ? (
        <p className="no-orders-message" style={{textAlign: 'center', color: '#fff', fontSize: '1.1rem'}}>Aún no has realizado ningún pedido.</p>
      ) : (
        <div 
          className="orders-cards-list" 
          style={{display: 'flex', flexDirection: 'column', gap: '15px'}}
        >
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="order-card"
              style={{
                display: 'flex',
                backgroundColor: '#ffffff', // Fondo blanco de la tarjeta
                borderRadius: '10px',
                padding: '15px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                alignItems: 'center',
                gap: '15px' // Espacio entre la imagen y el texto
              }}
            >
              {/* Placeholder de Imagen */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #a8ff78, #78ffd6)', // Degradado verde-amarillo
                flexShrink: 0 
              }}>
              </div>

              <div 
                className="order-details"
                style={{
                  flexGrow: 1, 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px'
                }}
              >
                <p className="order-title" style={{margin: 0, fontWeight: 'bold', color: '#333', fontSize: '1.1rem'}}>
                  Nro Pedido **#{order.id}**
                </p>
                <p style={{margin: 0, fontSize: '0.9rem', color: '#555'}}>
                  Estado: <span style={{
                    fontWeight: 'bold', 
                    color: order.estado?.toLowerCase() === 'entregado' ? '#27ae60' : '#f39c12'
                  }}>
                    {order.estado || 'Desconocido'}
                  </span>
                </p>
                <p style={{margin: 0, fontSize: '0.9rem', color: '#555'}}>
                  Fecha: {order.fecha || 'N/A'} Total: <span style={{fontWeight: 'bold', color: '#e74c3c'}}>Bs {order.total || '0.00'}</span>
                </p>
                <Link
                  to={`/perfil/pedidos/${order.id}`}
                  className="btn-details"
                  style={{
                    display: 'inline-block',
                    marginTop: '10px',
                    padding: '8px 15px',
                    backgroundColor: '#fcdb03', // Amarillo del botón
                    color: '#333', 
                    borderRadius: '5px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  Ver detalles
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