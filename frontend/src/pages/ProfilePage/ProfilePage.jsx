import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user, token, setUser } = useAuth(); // ✅ asegúrate de tener setUser en el contexto
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Efecto 1: actualizar los datos del usuario desde el backend
  useEffect(() => {
    async function fetchUserData() {
      if (!token) return;

      try {
        const res = await fetch("/api/clientes/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("No se pudo obtener el perfil del cliente");

        const freshUser = await res.json();
        console.log("♻️ Datos actualizados del cliente:", freshUser);

        // ✅ Actualizamos el usuario en el contexto global
        if (setUser) setUser((prev) => ({ ...prev, ...freshUser }));
      } catch (e) {
        console.error("Error al refrescar perfil:", e);
      }
    }

    fetchUserData();
  }, [token]);

  // 🔹 Efecto 2: cargar pedidos
  useEffect(() => {
    async function fetchOrders() {
      if (!token) {
        setIsLoading(false);
        setError("Usuario no autenticado.");
        return;
      }

      try {
        const response = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Error al cargar pedidos");

        const data = await response.json();
        setPedidos(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("No se pudieron cargar los pedidos. Intenta más tarde.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [token]);

  // 🔹 Formateo de fechas
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      console.error("Error al formatear fecha:", e);
      return dateString;
    }
  };

  // 🔹 Componente de pedido
  const PedidoItem = ({ pedido }) => (
    <article className="pedido-item">
      <div className="pedido-thumb" />
      <div className="pedido-info">
        <div>
          <strong>Nro Pedido</strong> #{pedido.id}
        </div>
        <div>
          Estado: <strong>{pedido.estado || "Desconocido"}</strong>
        </div>
        <div>
          Fecha:
          <span className="fecha-pedido">{formatDate(pedido.fecha)}</span>
          Total: <strong>Bs {pedido.total || "0.00"}</strong>
        </div>
        <button className="pedido-btn">Ver detalles</button>
      </div>
    </article>
  );

  // 🔹 Render
  return (
    <div className="ProfilePage">
      <div className="perfil-grid">
        <section className="perfil-card perfil-personal">
          <h2>Mi información personal</h2>

          <div className="perfil-row">
            <span>Nombre:</span> <strong>{user?.nombre || "—"}</strong>
          </div>
          <div className="perfil-row">
            <span>Correo electrónico:</span>{" "}
            <strong>{user?.email || "—"}</strong>
          </div>

          <h3>Dirección</h3>
          <div className="perfil-row">
            <span>Zona:</span> <strong>{user?.zona || "—"}</strong>
          </div>
          <div className="perfil-row">
            <span>Calle:</span> <strong>{user?.calle || "—"}</strong>
          </div>
          <div className="perfil-row">
            <span>Nro Vivienda:</span>{" "}
            <strong>{user?.numero_casa || "—"}</strong>
          </div>
        </section>

        {/* Pedidos (descomenta si quieres mostrar) */}
        {/* <section className="perfil-card perfil-pedidos">
          <h2>Mis pedidos</h2>

          {isLoading && <p>Cargando pedidos...</p>}
          {error && <p className="error-message">❌ {error}</p>}

          {!isLoading && !error && (
            <div className="pedidos-list">
              {pedidos.length > 0 ? (
                pedidos.map((pedido) => (
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
