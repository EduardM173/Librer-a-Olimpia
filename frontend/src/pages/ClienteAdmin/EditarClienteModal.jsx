import { useState } from "react";
import axios from "axios";
import "./ClienteAdmin.css";

export default function EditarClienteModal({ cliente, onClose, onSave }) {
  const [tipo, setTipo] = useState(cliente.tipo_cliente);
  const [estado, setEstado] = useState(cliente.estado ? 1 : 0);

  const handleGuardar = async () => {
    try {
      await axios.put(`http://localhost:3000/api/clientes/${cliente.id}`, {
        tipo_cliente: tipo,
        estado,
      });
      onSave(); // recargar lista
      onClose(); // cerrar modal
    } catch (error) {
      console.error("❌ Error al actualizar cliente:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        <h2>Editar Cliente</h2>
        <p><b>Nombre:</b> {cliente.nombre}</p>
        <p><b>Email:</b> {cliente.email}</p>

        <div className="form-grupo">
          <label>Rol (tipo de cliente):</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="modal-select"
          >
            <option value="MINORISTA">MINORISTA</option>
            <option value="MAYORISTA">MAYORISTA</option>
          </select>
        </div>

        <div className="form-grupo">
          <label>Estado:</label>
          <select
            value={estado}
            onChange={(e) => setEstado(Number(e.target.value))}
            className="modal-select"
          >
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
        </div>

        <div className="modal-botones">
          <button className="editar-btn" onClick={handleGuardar}>
            Guardar
          </button>
          <button
            className="editar-btn"
            style={{
              backgroundColor: "white",
              border: "2px solid red",
              color: "red",
            }}
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
