import React, { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2/dist/sweetalert2.all.js";
import "./PedidoExitoso.css";

export default function PedidoExitoso() {
  const q = new URLSearchParams(useLocation().search);
  const pedidoId = q.get("pedido");
  const navigate = useNavigate();

  // Mostrar SweetAlert2 al cargar
  useEffect(() => {
    if (!pedidoId) {
      Swal.fire({
        title: "⚠️ Pedido no encontrado",
        text: "No pudimos identificar tu pedido. Intenta nuevamente.",
        icon: "warning",
        confirmButtonText: "Volver al inicio",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        navigate("/catalogo");
      });
      return;
    }

    Swal.fire({
      title: "¡Pedido realizado con éxito! 🎉",
      html: `
        <p>Tu número de pedido es:</p>
        <h2 style="margin-top: 6px; color:#007bff;">#${pedidoId}</h2>
        <p style="margin-top: 10px; font-size:15px;">Recibirás un correo con el detalle de tu compra.</p>
      `,
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Ver mis pedidos",
      cancelButtonText: "Seguir comprando",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#f59e0b",
      reverseButtons: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/perfil/pedidos");
      } else {
        navigate("/catalogo");
      }
    });
  }, [pedidoId, navigate]);

  // Fallback silencioso por si falla SweetAlert
  return (
    <div className="PedidoOK">
      <h1>¡Pedido realizado con éxito! 🎉</h1>
      <p>
        Tu número de pedido es: <strong>#{pedidoId}</strong>
      </p>
      <p>Te enviaremos un correo con el detalle de tu compra.</p>
      <div className="ok-actions">
        <Link to="/catalogo" className="ok-btn">
          Seguir comprando
        </Link>
        <Link to="/perfil/pedidos" className="ok-btn outline">
          Ver mis pedidos
        </Link>
      </div>
    </div>
  );
}
