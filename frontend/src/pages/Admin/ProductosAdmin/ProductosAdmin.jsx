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

  // --- Cargar lista de productos ---
  const fetchProductos = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:3000/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(res.data.items || []);
    } catch (err) {
      console.error("❌ Error cargando productos:", err);
      setError(
        err.response?.status === 403
          ? "No tienes permisos para acceder al panel de productos."
          : "Error al cargar productos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [token]);

  // --- Filtro en memoria ---
  const productosFiltrados = useMemo(() => {
    const busqueda = filtroBusqueda.toLowerCase();
    if (!busqueda) return productos;
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(busqueda) ||
        p.sku.toLowerCase().includes(busqueda)
    );
  }, [productos, filtroBusqueda]);

  // --- Nuevo producto ---
  const handleNuevo = () => {
    setProductoSeleccionado(null);
    setMostrarModal(true);
  };

  // --- Editar producto ---
  const handleEditar = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarModal(true);
  };

  // --- Activar / Desactivar producto ---
  const handleActivarDesactivar = async (producto, activar) => {
    const confirmacion = window.confirm(
      `¿Seguro que deseas ${activar ? "ACTIVAR" : "DESACTIVAR"} el producto "${producto.nombre}"?`
    );
    if (!confirmacion) return;

    try {
      await axios.put(
        `http://localhost:3000/api/admin/products/${producto.id}`,
        { ...producto, activo: activar ? 1 : 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualiza en memoria
      setProductos((prev) =>
        prev.map((p) =>
          p.id === producto.id ? { ...p, activo: activar ? 1 : 0 } : p
        )
      );
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err);
      setError(`Error al ${activar ? "activar" : "desactivar"} el producto.`);
    }
  };

  // --- Cerrar modal ---
  const handleCloseModal = () => {
    setMostrarModal(false);
    setProductoSeleccionado(null);
  };

  // --- Guardar cambios desde modal ---
  const onSaveProducto = (productoGuardado) => {
    if (productoSeleccionado) {
      // Edición
      setProductos((prev) =>
        prev.map((p) =>
          p.id === productoGuardado.id ? { ...p, ...productoGuardado } : p
        )
      );
    } else {
      // Nuevo
      setProductos((prev) => [productoGuardado, ...prev]);
    }
    handleCloseModal();
  };

  // --- Render principal ---
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
              <th>Precio Venta (Bs)</th>
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
                <td>Bs {Number(p.precio_venta || 0).toFixed(2)}</td>
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

                  {p.activo === 1 ? (
                    <button
                      className="editar-btn btn-desactivar"
                      onClick={() => handleActivarDesactivar(p, false)}
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      className="editar-btn btn-activar"
                      onClick={() => handleActivarDesactivar(p, true)}
                    >
                      Activar
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
