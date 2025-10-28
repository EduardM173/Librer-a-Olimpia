import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import ProductoModalAdmin from "../../../components/Admin/ProductoModalAdmin/ProductoModalAdmin";
import "../../ClienteAdmin/ClienteAdmin.css";

export default function ProductosAdmin() {
  const { token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // --- Carga de datos ---
  const fetchProductos = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:3000/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // La API devuelve { items: [...], meta: {...} }
      setProductos(res.data.items || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 403
          ? "No tienes permisos."
          : "Error al cargar productos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [token]);

  // --- Filtrado (lado del cliente) ---
  const productosFiltrados = useMemo(() => {
    const busqueda = filtroBusqueda.toLowerCase();
    if (!busqueda) return productos;
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(busqueda) ||
        p.sku.toLowerCase().includes(busqueda)
    );
  }, [productos, filtroBusqueda]);

  // --- Handlers ---
  const handleNuevo = () => {
    setProductoSeleccionado(null); // 'null' indica que es "Nuevo"
    setMostrarModal(true);
  };

  const handleEditar = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarModal(true);
  };

  const handleDesactivar = async (producto) => {
    if (
      !window.confirm(
        `¿Seguro que quieres desactivar el producto "${producto.nombre}"?`
      )
    )
      return;

    try {
      await axios.delete(
        `http://localhost:3000/api/admin/products/${producto.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Actualiza el estado local (sin recargar)
      setProductos((prev) =>
        prev.map((p) =>
          p.id === producto.id ? { ...p, activo: 0 } : p
        )
      );
    } catch (err) {
      console.error("Error al desactivar el producto:", err);
      setError("Error al desactivar el producto.");
    }
  };

  // --- Handlers del Modal ---
  const handleCloseModal = () => {
    setMostrarModal(false);
    setProductoSeleccionado(null);
  };

  // Callback cuando el modal guarda (crea o edita)
  const onSaveProducto = (productoGuardado) => {
    if (productoSeleccionado) {
      // Editando
      setProductos((prev) =>
        prev.map((p) =>
          p.id === productoGuardado.id ? { ...p, ...productoGuardado } : p
        )
      );
    } else {
      // Creando
      // NOTA: El productoGuardado (nuevo) no tiene "stock" o "categoria" (nombre)
      // Lo ideal es recargar, pero por UX lo agregamos al inicio
      setProductos((prev) => [productoGuardado, ...prev]);
      // Opcionalmente, recarga todo: fetchProductos();
    }
    handleCloseModal();
  };

  return (
    <div className="cliente-admin-container">
      <h1 className="titulo">Gestión de Productos</h1>

      {error && <p className="admin-error">{error}</p>}

      <div className="buscador">
        <input
          type="text"
          placeholder="Buscar por SKU o nombre..."
          value={filtroBusqueda}
          onChange={(e) => setFiltroBusqueda(e.target.value)}
        />
        <button onClick={handleNuevo} className="btn-nuevo-producto">
          + Nuevo Producto
        </button>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <table className="tabla-clientes">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Precio Venta</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p) => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria || "N/A"}</td>
                <td>{p.stock}</td>
                <td>Bs {Number(p.precio_venta).toFixed(2)}</td>
                
                <td>
                  {p.activo ? (
                    <span className="badge-activo">Activo</span>
                  ) : (
                    <span className="badge-inactivo">Inactivo</span>
                  )}
                </td>
                <td className="admin-table-actions">
                  <button
                    className="editar-btn"
                    onClick={() => handleEditar(p)}
                  >
                    Editar
                  </button>
                  {p.activo === 1 && ( // Solo muestra Desactivar si está activo
                    <button
                      className="editar-btn btn-desactivar"
                      onClick={() => handleDesactivar(p)}
                    >
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- Modal --- */}
      {mostrarModal && (
        <ProductoModalAdmin
          producto={productoSeleccionado}
          onClose={handleCloseModal}
          onSave={onSaveProducto}
        />
      )}
    </div>
  );
}