import React from "react";
import { useLocation, Link } from "react-router-dom";
import "./PedidoExitoso.css";

export default function PedidoExitoso() {
  const q = new URLSearchParams(useLocation().search);
  const pedidoId = q.get("pedido");

  return (
    <div className="PedidoOK">
      <h1>¡Pedido realizado con éxito! 🎉</h1>
      <p>Tu número de pedido es: <strong>#{pedidoId}</strong></p>
      <p>Te enviaremos un correo con el detalle de tu compra.</p>
      <div className="ok-actions">
        <Link to="/catalogo" className="ok-btn">Seguir comprando</Link>
        <Link to="/perfil/pedidos" className="ok-btn outline">Ver mis pedidos</Link>
      </div>
    </div>
  );
}
