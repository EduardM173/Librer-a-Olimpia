import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import "../../../pages/ClienteAdmin/ClienteAdmin.css";

// Estado inicial para un producto nuevo
const initialState = {
  nombre: "",
  sku: "",
  descripcion: "",
  categoria_id: "", // Usamos "" para "Sin Categoría"
  precio_venta: "",
  imagen_url: "",
  activo: 1, // Por defecto 'activo' al crear
};

export default function ProductoModalAdmin({ producto, onClose, onSave }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState(
    producto ? { ...producto } : initialState
  );
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!producto?.id;

  // --- Cargar categorías para el <select> ---
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        // Reutilizamos el endpoint público de categorías
        const res = await axios.get(
          "http://localhost:3000/api/products/categories"
        );
        setCategorias(res.data || []);
      } catch (err) {
        console.error("Error al cargar categorías", err);
        setError("No se pudieron cargar las categorías.");
      }
    };
    fetchCategorias();
  }, []);

  // --- Handlers del formulario ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !token) return;

    setLoading(true);
    setError("");

    // Preparamos los datos
    const dataToSend = {
      ...formData,
      // Aseguramos que los números sean números y los nulos sean nulos
      precio_venta: Number(formData.precio_venta) || 0,
      categoria_id: formData.categoria_id || null,
      activo: formData.activo ? 1 : 0,
    };

    try {
      let res;
      if (isEdit) {
        // --- Actualizar (PUT) ---
        res = await axios.put(
          `http://localhost:3000/api/admin/products/${producto.id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // --- Crear (POST) ---
        res = await axios.post(
          "http://localhost:3000/api/admin/products",
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Llamamos al callback 'onSave' con los datos actualizados/creados
      // Si es nuevo, res.data tiene { id, message }. Si es editado, { id, message }
      onSave({ ...dataToSend, id: res.data.id });

    } catch (err) {
      console.error("Error al guardar:", err);
      const msg = err.response?.data?.message || "Error al guardar.";
      if (msg.includes("SKU")) {
        setError("Error: Ese SKU ya está en uso.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-contenido"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="admin-modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>{isEdit ? "Editar Producto" : "Nuevo Producto"}</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          {/* Fila 1: Nombre y SKU */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="sku">SKU</label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Fila 2: Descripción */}
          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="3"
              value={formData.descripcion || ""}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Fila 3: Categoría, Venta, Costo */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categoria_id">Categoría</label>
              <select
                id="categoria_id"
                name="categoria_id"
                value={formData.categoria_id || ""}
                onChange={handleChange}
                className="modal-select"
              >
                <option value="">-- Sin Categoría --</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="precio_venta">Precio Venta (Bs)</label>
              <input
                type="number"
                step="0.01"
                id="precio_venta"
                name="precio_venta"
                value={formData.precio_venta}
                onChange={handleChange}
                required
              />
            </div>
            
          </div>

          {/* Fila 4: Imagen y Estado */}
          <div className="form-row">
            <div className="form-group" style={{ flexGrow: 3 }}>
              <label htmlFor="imagen_url">URL de Imagen</label>
              <input
                type="text"
                id="imagen_url"
                name="imagen_url"
                value={formData.imagen_url || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group-checkbox">
              <label htmlFor="activo">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo == 1} // Usamos '==' para
                  onChange={handleChange}
                />
                Activo
              </label>
            </div>
          </div>

          {/* Errores y Botones */}
          {error && <p className="form-error">{error}</p>}
          <div className="modal-botones">
            <button
              type="button"
              className="editar-btn btn-cancelar"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="editar-btn"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
const styles = `
.form-row {
  display: flex;
  gap: 16px;
  width: 100%;
}
.form-row > .form-grupo {
  flex: 1;
}
.form-grupo label {
  font-weight: 500;
  margin-bottom: 5px;
  display: block;
}
.form-grupo input[type="text"],
.form-grupo input[type="number"],
.form-grupo textarea,
.form-grupo select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box; /* Importante */
}
.form-error {
  color: red;
  margin: 0;
  text-align: left;
  flex-grow: 1;
}
`;
// Inyectamos los estilos en el <head>
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);