import { useEffect, useState } from "react";
import axios from "axios";
import "./PedidosAdmin.css";
import PedidoModal from "../components/PedidoModal.jsx";

export default function PedidosAdmin() {
    const [pedidos, setPedidos] = useState([]);
    const [filtroEstado, setFiltroEstado] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    // ===== Obtener todos los pedidos =====
    useEffect(() => {
        obtenerPedidos();
    }, []);

    const obtenerPedidos = async () => {
        try {
            const res = await axios.get("http://localhost:3000/pedidos");
            setPedidos(res.data);
        } catch (err) {
            console.error("Error al obtener pedidos:", err);
        }
    };

    // ===== Filtrar pedidos =====
    const filtrarPedidos = () => {
        return pedidos.filter((p) => {
            const textoBusqueda = busqueda.toLowerCase().trim();

            const coincideEstado =
                !filtroEstado ||
                p.estado.toLowerCase().includes(filtroEstado.toLowerCase());

            const coincideBusqueda =
                !busqueda ||
                p.id.toString().includes(textoBusqueda) ||
                p.cliente.toLowerCase().includes(textoBusqueda) ||
                p.fecha_pedido?.toLowerCase().includes(textoBusqueda) ||
                p.total_neto?.toString().includes(textoBusqueda) ||
                p.estado.toLowerCase().includes(textoBusqueda) ||
                p.usuario?.toLowerCase().includes(textoBusqueda);

            return coincideEstado && coincideBusqueda;
        });
    };

    // ===== Obtener detalles de un pedido =====
    const handleSeleccionarPedido = async (pedidoBase, modoEdicion = false) => {
        try {
            const res = await axios.get(
                `http://localhost:3000/pedidos/${pedidoBase.id}`
            );
            const pedidoConDetalle = res.data.pedido;
            pedidoConDetalle.modoEdicion = modoEdicion; // 🔹 agrega el flag
            setPedidoSeleccionado(pedidoConDetalle);
            setMostrarModal(true);
        } catch (error) {
            console.error("Error al obtener detalles del pedido:", error);
        }
    };


    const pedidosFiltrados = filtrarPedidos();

    return (
        <div className="contenedor">
            <h1 className="titulo">Gestión de Pedidos</h1>

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

                <button onClick={obtenerPedidos}>Filtrar</button>
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
                            <td>{p.total_neto}</td>
                            <td>{p.estado}</td>
                            <td>
                                <button
                                    className="editar-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSeleccionarPedido(p, true); // 🔹 segundo parámetro: modo edición
                                    }}
                                >Editar</button>

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

            {/* Modal */}
            {mostrarModal && (
                <PedidoModal
                    pedido={pedidoSeleccionado}
                    onClose={() => setMostrarModal(false)}
                />
            )}
        </div>
    );
}
