import { useEffect, useState } from "react";
import axios from "axios";
import "./PedidosAdmin.css";
import PedidoModal from "../../components/PedidoModal/PedidoModal.jsx";
import { useAuth } from "../../context/AuthContext";

export default function PedidosAdmin() {
  const { token, user, openLogin } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [error, setError] = useState("");

  // ===== Obtener pedidos =====
  useEffect(() => {
    if (!token) {
      setError("Debes iniciar sesión como administrador para ver los pedidos.");
      return;
    }
    obtenerPedidos();
  }, [token]);

  const obtenerPedidos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/pedidos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPedidos(res.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 403)
        setError("No tienes permisos para ver los pedidos.");
      else setError("Error al cargar los pedidos. Intenta nuevamente.");
    }
  };

  // ===== Actualizar estado en tiempo real =====
  const actualizarPedidoEnLista = (pedidoActualizado) => {
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoActualizado.id ? { ...p, estado: pedidoActualizado.estado } : p
      )
    );
  };

  // ===== Filtrar pedidos =====
  const filtrarPedidos = () =>
    pedidos.filter((p) => {
      const texto = busqueda.toLowerCase().trim();
      const coincideEstado =
        !filtroEstado ||
        p.estado.toLowerCase().includes(filtroEstado.toLowerCase());
      const coincideBusqueda =
        !busqueda ||
        p.id.toString().includes(texto) ||
        p.cliente?.toLowerCase().includes(texto) ||
        p.fecha_pedido?.toLowerCase().includes(texto) ||
        p.total_neto?.toString().includes(texto) ||
        p.estado.toLowerCase().includes(texto) ||
        p.usuario?.toLowerCase().includes(texto);
      return coincideEstado && coincideBusqueda;
    });

  const handleSeleccionarPedido = async (pedidoBase, modoEdicion = false) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/pedidos/${pedidoBase.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const pedidoConDetalle = res.data.pedido;
      pedidoConDetalle.modoEdicion = modoEdicion;
      setPedidoSeleccionado(pedidoConDetalle);
      setMostrarModal(true);
    } catch {
      setError("No se pudo cargar el detalle del pedido.");
    }
  };

  const pedidosFiltrados = filtrarPedidos();

  return (
    <div className="contenedor">
      <h1 className="titulo">Gestión de Pedidos</h1>

      {error ? (
        <div className="error-box">
          <p>{error}</p>
          {!token && (
            <button className="btn-login" onClick={openLogin}>
              Iniciar sesión
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="filtros">
            <input
              type="text"
              className="buscador"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente, fecha o total..."
            />

            <select
              className="estado-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Estado:</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>

            <button onClick={obtenerPedidos}>Actualizar</button>
          </div>

          <table className="tabla">
            <thead>
              <tr>
                <th>Nro Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((p) => (
                <tr
                  key={p.id}
                  className="fila-pedido"
                  onClick={() => handleSeleccionarPedido(p)}
                >
                  <td>{p.id}</td>
                  <td>{new Date(p.fecha_pedido).toLocaleDateString()}</td>
                  <td>{p.cliente}</td>
                  <td>Bs {Number(p.total_neto).toFixed(2)}</td>
                  <td>{p.estado}</td>
                  <td>
                    <button
                      className="editar-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSeleccionarPedido(p, true);
                      }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}

              {pedidosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No hay pedidos con ese estado
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {mostrarModal && (
            <PedidoModal
              pedido={pedidoSeleccionado}
              onClose={() => setMostrarModal(false)}
              onActualizarPedido={actualizarPedidoEnLista}
            />
          )}
        </>
      )}
    </div>
  );
}
