import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import "./ProductoModalAdmin.css";

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
  const [imagenFile, setImagenFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const isEdit = !!producto?.id;

  // --- Cargar categorías y producto ---
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      setLoadingData(true);
      setError("");

      try {
        const resCat = await axios.get("http://localhost:3000/api/products/categories");
        setCategorias(resCat.data || []);

        if (isEdit) {
          const resProd = await axios.get(
            `http://localhost:3000/api/admin/products/${producto.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setFormData(resProd.data);
          if (resProd.data.imagen_url)
            setPreviewUrl(`http://localhost:5173${resProd.data.imagen_url}`);
        } else {
          setFormData(initialState);
        }
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
        if (err.config?.url?.includes("categories")) {
          setError("No se pudieron cargar las categorías. (Verifica el backend)");
        } else {
          setError("Error al cargar el producto.");
        }
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [producto, isEdit, token]);

  // --- Manejar cambios de campos ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  // --- Manejar imagen ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- Subir imagen y devolver la ruta ---
  const uploadImage = async () => {
    if (!imagenFile) return formData.imagen_url || "";
    const form = new FormData();
    form.append("imagen", imagenFile);

    const res = await axios.post("http://localhost:3000/api/upload/image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.imagePath; // /IMG/xxx.jpg
  };

  // --- Guardar producto ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingSubmit || !token) return;
    setLoadingSubmit(true);
    setError("");

    try {
      const imagePath = await uploadImage();
      const dataToSend = {
        ...formData,
        precio_venta: Number(formData.precio_venta) || 0,
        categoria_id: formData.categoria_id || null,
        imagen_url: imagePath,
        activo: formData.activo ? 1 : 0,
      };
      delete dataToSend.stock;

      let response;
      if (isEdit) {
        response = await axios.put(
          `http://localhost:3000/api/admin/products/${producto.id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onSave({ ...dataToSend, id: producto.id });
      } else {
        response = await axios.post(
          "http://localhost:3000/api/admin/products",
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onSave({ ...dataToSend, id: response.data.id });
      }
    } catch (err) {
      console.error("❌ Error al guardar producto:", err);
      const msg = err.response?.data?.message || "Error al guardar.";
      setError(msg.includes("SKU") ? "Ese SKU ya está en uso." : msg);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // --- Render ---
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-contenido"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{isEdit ? "Editar Producto" : "Nuevo Producto"}</h2>

        {loadingData ? (
          <p style={{ textAlign: "center", margin: "30px 0" }}>Cargando datos...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-grupo">
                <label>Nombre</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-grupo">
                <label>SKU</label>
                <input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grupo">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                rows="3"
                value={formData.descripcion || ""}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-grupo">
                <label>Categoría</label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id || ""}
                  onChange={handleChange}
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
                <label>Precio Venta (Bs)</label>
                <input
                  type="number"
                  name="precio_venta"
                  step="0.01"
                  value={formData.precio_venta}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* === Campo de imagen mejorado === */}
            <div className="form-row">
              <div className="form-grupo" style={{ flexGrow: 3 }}>
                <label>Imagen del producto</label>
                <div className="input-imagen">
                  <label htmlFor="imagen">Elegir imagen</label>
                  <input
                    id="imagen"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <span>{imagenFile ? imagenFile.name : "Ningún archivo seleccionado"}</span>
                </div>

                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="preview"
                  />
                )}
              </div>

              <div className="form-grupo-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo == 1}
                    onChange={handleChange}
                  />
                  Activo
                </label>
              </div>
            </div>

            {/* === Botones === */}
            <div className="modal-botones">
              {error && <p className="form-error">{error}</p>}
              <button
                type="button"
                onClick={onClose}
                disabled={loadingSubmit}
                className="boton boton-cancelar"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loadingSubmit}
                className="boton"
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
