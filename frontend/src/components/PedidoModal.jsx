import { useState } from "react";
import axios from "axios";
import "./PedidoModal.css";

export default function PedidoModal({ pedido, onClose }) {
    const [formData, setFormData] = useState({
        cliente: pedido.cliente,
        estado: pedido.estado,
        zona_envio: pedido.zona_envio || "",
    });

    const editable = pedido.modoEdicion; // 🔹 modo edición o lectura

    // === Cálculos de totales ===
    const subtotal = pedido.detalle
        ? pedido.detalle.reduce(
            (sum, prod) => sum + parseFloat(prod.importe_neto || 0),
            0
        )
        : 0;
    const costoEnvio = 0;
    const total = subtotal + costoEnvio;

    // === Manejo de cambios en campos ===
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // === Guardar cambios ===
    const handleGuardar = async () => {
        try {
            await axios.patch(`http://localhost:3000/pedidos/${pedido.id}`, formData);
            alert("✅ Pedido actualizado correctamente");
            onClose();
        } catch (error) {
            console.error("Error al actualizar pedido:", error);
            alert("❌ No se pudo actualizar el pedido");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">Pedido</h2>

                <p><strong>Nro pedido:</strong> {pedido.id}</p>

                <p>
                    <strong>Cliente:</strong>
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

                <p><strong>Fecha:</strong> {new Date(pedido.fecha_pedido).toLocaleDateString()}</p>

                <p>
                    <strong>Estado actual:</strong>
                    <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                    >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="ENTREGADO">Entregado</option>
                        <option value="CANCELADO">Cancelado</option>
                    </select>
                </p>

                <p>
                    <strong>Zona del envío:</strong>
                    {editable ? (
                        <input
                            type="text"
                            name="zona_envio"
                            value={formData.zona_envio}
                            onChange={handleChange}
                        />
                    ) : (
                        <span>{pedido.zona_envio || "Sin zona definida"}</span>
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
                        <p><strong>Sub total:</strong> {subtotal.toFixed(2)}</p>
                        <p><strong>Costo envío:</strong> {costoEnvio.toFixed(2)}</p>
                        <p><strong>Total:</strong> {total.toFixed(2)}</p>
                    </div>
                </div>


                {/* === Actualizar estado (en ambos modos) === */}
                <div className="actualizar-estado">
                    <label><strong>Actualizar Estado:</strong></label>
                    <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                    >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="ENTREGADO">Entregado</option>
                        <option value="CANCELADO">Cancelado</option>
                    </select>
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
