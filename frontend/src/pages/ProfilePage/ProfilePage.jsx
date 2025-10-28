import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useAuth } from '../../context/AuthContext'; // Asumo que `useAuth` proporciona el token si es necesario

export default function ProfilePage() {
  const { user, token } = useAuth(); // Asumo que useAuth también provee el token
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos de dirección aún no ligados al backend (estático por ahora)
  const direccion = { zona: '—', calle: '—', numero: '—' };

  // 1. Efecto para cargar los pedidos
  useEffect(() => {
    async function fetchOrders() {
      if (!token) {
        setIsLoading(false);
        setError("Usuario no autenticado.");
        return;
      }

      try {
        console.log("🗿🔥1");
        const response = await fetch('/api/orders', { // Ajusta la ruta si es necesario
        
          headers: {
            
            'Authorization': `Bearer ${token}`, // Envía el token de autenticación
            'Content-Type': 'application/json',
          },
          
        });
        console.log("🗿🔥2");
        if (!response.ok) {
          throw new Error(`Error al cargar pedidos: ${response.statusText}`);
          console.log("🗿🔥3");
        }
        
        const data = await response.json();
        console.log("🗿🔥4");
        console.log(data);
        setPedidos(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("No se pudieron cargar los pedidos. Intenta de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [token]); // Se ejecuta cuando el componente se monta o el token cambia

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };


  // Función para renderizar un solo pedido (DRY)
  const PedidoItem = ({ pedido }) => (
    <article className="pedido-item">
      <div className="pedido-thumb" />
      <div className="pedido-info">
        <div>
          <strong>Nro Pedido</strong> #{pedido.id}
        </div>
        <div>
          Estado: <strong>{pedido.estado || 'Desconocido'}</strong>
        </div>
        <div>
          Fecha: {formatDate(pedido.fecha)} &nbsp;&nbsp; Total:{" "}
          <strong>Bs {pedido.total || '0.00'}</strong>
        </div>
        {/* Aquí puedes enlazar a la vista de detalles del pedido si existe */}
        <button className="pedido-btn">Ver detalles</button>
      </div>
    </article>
  );

  return (
    <div className="ProfilePage">
      <div className="perfil-grid">
        {/* Columna izquierda: información personal */}
        <section className="perfil-card perfil-personal">
          <h2>Mi información personal</h2>
          <div className="perfil-row">
            <span>Nombre:</span> <strong>{user?.nombre || '—'}</strong>
          </div>
          <div className="perfil-row">
            <span>Correo electrónico:</span>{" "}
            <strong>{user?.email || '—'}</strong>
          </div>
          <div className="perfil-row">
            <span>Nro Celular:</span> <strong>—</strong>
          </div>

          <h3>Dirección</h3>
          <div className="perfil-row">
            <span>Zona:</span> <strong>{direccion.zona}</strong>
          </div>
          <div className="perfil-row">
            <span>Calle:</span> <strong>{direccion.calle}</strong>
          </div>
          <div className="perfil-row">
            <span>Nro Vivienda:</span> <strong>{direccion.numero}</strong>
          </div>
        </section>

        
        {/* <section className="perfil-card perfil-pedidos">
          <h2>Mis pedidos</h2>

          {isLoading && <p>Cargando pedidos...</p>}
          {error && <p className="error-message">❌ {error}</p>}

          {!isLoading && !error && (
            <div className="pedidos-list">
              {pedidos.length > 0 ? (
                pedidos.map((pedido) => (
                  // 4. Renderizado dinámico de la lista de pedidos
                  <PedidoItem key={pedido.id} pedido={pedido} />
                ))
              ) : (
                <p>Aún no tienes pedidos registrados.</p>
              )}
            </div>
          )}
        </section> */}
      </div>
    </div>
  );
}