import { useEffect, useState } from "react";
import axios from "axios";
import "./ClienteAdmin.css";
import EditarClienteModal from "./EditarClienteModal";

export default function ClienteAdmin() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/clientes")
      .then((res) => setClientes(res.data))
      .catch((err) => console.error("❌ Error al cargar clientes:", err));
  }, []);

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.email?.toLowerCase().includes(filtro.toLowerCase())
  );

  const formatFecha = (fecha) => {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const verPedidos = (id) => {
    window.location.href = `/admin/pedidos?cliente=${id}`;
  };

  const editarCliente = (id) => {
    window.location.href = `/admin/clientes/${id}/editar`;
  };

  const cambiarEstado = async (cliente, nuevoEstado) => {
    try {
      await axios.put(`http://localhost:3000/api/clientes/${cliente.id}`, {
        tipo_cliente: cliente.tipo_cliente,
        estado: nuevoEstado,
      });

      // Recargar lista después del cambio
      const res = await axios.get("http://localhost:3000/api/clientes");
      setClientes(res.data);
    } catch (error) {
      console.error("❌ Error al actualizar estado:", error);
    }
  };


  return (
    <div className="contenedor">
      {/* ======= Título ======= */}
      <h1 className="titulo">Gestión de Clientes</h1>

      {/* ======= Filtros ======= */}
      <div className="filtros">
        <input
          type="text"
          className="buscador"
          placeholder="Buscar por nombre o correo"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        <button onClick={() => setFiltro("")}>Buscar</button>
      </div>

      {/* ======= Tabla ======= */}
      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Fecha de registro</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.length === 0 ? (
            <tr>
              <td colSpan="6">No hay clientes registrados.</td>
            </tr>
          ) : (
            clientesFiltrados.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nombre}</td>
                <td>{cliente.email}</td>
                <td>{cliente.tipo_cliente}</td>
                <td>{formatFecha(cliente.fecha_registro)}</td>
                <td>
                  <select
                    className="estado-select"
                    value={cliente.estado ? "1" : "0"}
                    onChange={(e) =>
                      cambiarEstado(cliente, e.target.value === "1" ? 1 : 0)
                    }
                  >

                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </td>
                <td>
                  <button
                    className="editar-btn"
                    onClick={() => setClienteSeleccionado(cliente)}
                  >
                    Editar
                  </button>
                  <button
                    className="editar-btn"
                    style={{
                      backgroundColor: "white",
                      color: "red",
                      border: "2px solid red",
                      marginLeft: "10px",
                    }}
                    onClick={() => verPedidos(cliente.id)}
                  >
                    Ver pedidos
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {clienteSeleccionado && (
        <EditarClienteModal
          cliente={clienteSeleccionado}
          onClose={() => setClienteSeleccionado(null)}
          onSave={() => {
            axios
              .get("http://localhost:3000/api/clientes")
              .then((res) => setClientes(res.data));
            setClienteSeleccionado(null);
          }}
        />
      )}

    </div>
  );
}
