import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import "../../../pages/ClienteAdmin/ClienteAdmin.css"; 

// Estado inicial para "Nuevo Producto"
const initialState = {
  nombre: "",
  sku: "",
  descripcion: "",
  categoria_id: "",
  precio_venta: "",
  imagen_url: "",
  activo: 1,
};

export default function ProductoModalAdmin({ producto, onClose, onSave }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [categorias, setCategorias] = useState([]);
  
  // Estados de carga
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Para el botón de Guardar
  const [loadingData, setLoadingData] = useState(true);   // Para cargar datos al abrir
  
  const [error, setError] = useState("");

  const isEdit = !!producto?.id;

  // --- Cargar datos del Modal (Categorías y Detalles del Producto) ---
  useEffect(() => {
    const loadModalData = async () => {
      if (!token) return;
      
      setLoadingData(true);
      setError("");
      
      try {
        // 1. Siempre trae las categorías
        // (Asegúrate de que el backend tenga esta ruta, ver paso 2)
        const resCat = await axios.get(
          "http://localhost:3000/api/products/categories"
        );
        setCategorias(resCat.data || []);

        // 2. Si es "Editar", busca los datos completos del producto
        if (isEdit) {
          const resProd = await axios.get(
            `http://localhost:3000/api/admin/products/${producto.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Rellena el formulario con los datos de la BD
          setFormData(resProd.data); 
        } else {
          // Si es "Nuevo", asegura que el formulario esté vacío
          setFormData(initialState);
        }

      } catch (err) {
        console.error("Error al cargar datos del modal", err);
        if (err.config.url.includes('categories')) {
          setError("No se pudieron cargar las categorías. (Verifica el backend)");
        } else {
          setError("No se pudo cargar el detalle del producto.");
        }
      } finally {
        setLoadingData(false); // Termina la carga
      }
    };
    
    loadModalData();
  }, [producto, isEdit, token]); // Se ejecuta cada vez que el 'producto' cambia

  
  // --- Handlers del formulario ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingSubmit || !token) return;

    setLoadingSubmit(true);
    setError("");

    const dataToSend = {
      ...formData,
      precio_venta: Number(formData.precio_venta) || 0,
      categoria_id: formData.categoria_id || null,
      activo: formData.activo ? 1 : 0,
    };
    delete dataToSend.precio_costo; // Por si acaso
    delete dataToSend.stock; // No enviamos el stock de vuelta

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:3000/api/admin/products/${producto.id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:3000/api/admin/products",
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onSave(); // Llama a onSave sin argumentos (la tabla se recarga sola)

    } catch (err) {
      console.error("Error al guardar:", err);
      const msg = err.response?.data?.message || "Error al guardar.";
      setError(msg.includes("SKU") ? "Error: Ese SKU ya está en uso." : msg);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-contenido"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "800px", maxWidth: "90%" }} 
      >
        <h2>{isEdit ? "Editar Producto" : "Nuevo Producto"}</h2>

        {/* --- ESTADO DE CARGA --- */}
        {loadingData ? (
          <p style={{textAlign: 'center', margin: '30px 0'}}>Cargando datos...</p>
        ) : (
        /* --- FORMULARIO --- */
        <form onSubmit={handleSubmit}>
          
          {/* Fila 1: Nombre y SKU */}
          <div className="form-row">
            <div className="form-grupo">
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
            <div className="form-grupo">
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
          <div className="form-grupo" style={{ marginBottom: "16px" }}>
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="3"
              value={formData.descripcion || ""}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Fila 3: Categoría y Venta */}
          <div className="form-row">
            <div className="form-grupo">
              <label htmlFor="categoria_id">Categoría</label>
              <select
                id="categoria_id"
                name="categoria_id"
                // Asegura que el valor sea string para el <select>
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
            <div className="form-grupo">
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
            <div className="form-grupo" style={{ flexGrow: 3 }}>
              <label htmlFor="imagen_url">URL de Imagen</label>
              <input
                type="text"
                id="imagen_url"
                name="imagen_url"
                value={formData.imagen_url || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-grupo-checkbox">
              <label htmlFor="activo">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo == 1}
                  onChange={handleChange}
                />
                Activo
              </label>
            </div>
          </div>

          {/* Fila 5: Botones y Errores */}
          <div className="modal-botones" style={{ marginTop: "20px" }}>
            {error && <p className="form-error">{error}</p>}
            <button
              type="button"
              className="editar-btn btn-cancelar"
              onClick={onClose}
              disabled={loadingSubmit}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="editar-btn"
              disabled={loadingSubmit}
            >
              {loadingSubmit ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}