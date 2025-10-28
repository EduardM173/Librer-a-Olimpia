import { useState } from "react";
import axios from "axios";
import "./PedidoModal.css";
import { useAuth } from "../../context/AuthContext";

export default function PedidoModal({ pedido, onClose, onActualizarPedido }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    cliente: pedido.cliente,
    estado: pedido.estado,
    direccion_envio: pedido.direccion_envio || "",
  });
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(""); // "ok" o "error"

  const editable = pedido.modoEdicion;

  const subtotal = pedido.detalle?.reduce(
    (sum, prod) => sum + parseFloat(prod.importe_neto || 0),
    0
  ) || 0;
  const costoEnvio = 0;
  const total = subtotal + costoEnvio;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGuardar = async () => {
    try {
      const res = await axios.patch(
        `http://localhost:3000/api/pedidos/${pedido.id}/estado`,
        { estado: formData.estado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onActualizarPedido(res.data.pedidoActualizado || { ...pedido, estado: formData.estado });
      setMensaje("✅ Pedido actualizado correctamente");
      setTipoMensaje("ok");

      setTimeout(() => {
        setMensaje("");
        onClose();
      }, 1200);
    } catch (error) {
      setTipoMensaje("error");
      if (error.response?.status === 403)
        setMensaje("❌ No tienes permisos para actualizar este pedido.");
      else if (error.response?.status === 404)
        setMensaje("❌ Pedido no encontrado.");
      else setMensaje("❌ No se pudo actualizar. Intenta nuevamente.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Pedido #{pedido.id}</h2>

        {mensaje && (
          <div
            className={`mensaje ${tipoMensaje === "ok" ? "exito" : "error"}`}
          >
            {mensaje}
          </div>
        )}

        <p>
          <strong>Cliente:</strong>{" "}
          {editable ? (
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
            />
          ) : (
            <span>{pedido.cliente}</span>
          )}
        </p>

        <p>
          <strong>Fecha:</strong>{" "}
          {new Date(pedido.fecha_pedido).toLocaleDateString()}
        </p>

        <p>
          <strong>Estado actual:</strong>{" "}
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            disabled={!editable}
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </p>

        <p>
          <strong>Dirección de envío:</strong>{" "}
          {editable ? (
            <input
              type="text"
              name="direccion_envio"
              value={formData.direccion_envio}
              onChange={handleChange}
              placeholder="Ej: Zona Sopocachi, Calle Rosendo Gutiérrez #123"
            />
          ) : (
            <span>{pedido.direccion_envio || "Sin dirección registrada"}</span>
          )}
        </p>

        <h3>Productos</h3>
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Precio U</th>
              <th>Precio total</th>
            </tr>
          </thead>
          <tbody>
            {pedido.detalle?.map((prod, i) => (
              <tr key={i}>
                <td>{prod.producto}</td>
                <td>{prod.cantidad}</td>
                <td>{prod.precio_unitario}</td>
                <td>{prod.importe_neto}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totales">
          <div className="totales-valores">
            <p><strong>Sub total:</strong> Bs {subtotal.toFixed(2)}</p>
            <p><strong>Costo envío:</strong> Bs {costoEnvio.toFixed(2)}</p>
            <p><strong>Total:</strong> Bs {total.toFixed(2)}</p>
          </div>
        </div>

        <div className="acciones">
          {editable ? (
            <button className="descargar-btn" onClick={handleGuardar}>
              Guardar Cambios
            </button>
          ) : (
            <button className="descargar-btn">Descargar</button>
          )}
          <button className="cerrar-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
