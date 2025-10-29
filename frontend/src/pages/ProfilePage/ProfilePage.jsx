import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const { user, token, setUser } = useAuth();
  const [formData, setFormData] = useState({
    nit_ci: "",
    zona: "",
    calle: "",
    numero_casa: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔹 Cargar datos actuales
  useEffect(() => {
    if (user) {
      setFormData({
        nit_ci: user.nit_ci || "",
        zona: user.zona || "",
        calle: user.calle || "",
        numero_casa: user.numero_casa || "",
      });
    }
  }, [user]);

  // 🔹 Cambiar valores
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Validar antes de guardar
  const validateForm = () => {
    if (formData.nit_ci && !/^[0-9]+$/.test(formData.nit_ci)) {
      Swal.fire("Error", "El NIT/CI solo debe contener números.", "error");
      return false;
    }
    if (formData.zona.trim().length < 3) {
      Swal.fire("Error", "La zona debe tener al menos 3 caracteres.", "error");
      return false;
    }
    if (formData.calle.trim().length < 3) {
      Swal.fire("Error", "La calle debe tener al menos 3 caracteres.", "error");
      return false;
    }
    return true;
  };

  // 🔹 Guardar cambios (solo al presionar “Guardar cambios”)
  const handleSave = async () => {
    if (!token) return Swal.fire("Error", "No estás autenticado.", "error");
    if (!validateForm()) return;

    setSaving(true);
    try {
      const res = await fetch("http://localhost:3000/api/clientes/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al actualizar datos.");

      setUser((prev) => ({ ...prev, ...data.cliente }));

      Swal.fire({
        icon: "success",
        title: "✅ Datos actualizados",
        text: "Tus cambios se guardaron correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });

      setEditMode(false);
    } catch (err) {
      console.error("❌ Error actualizando perfil:", err);
      Swal.fire("Error", "No se pudieron guardar los cambios.", "error");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Cancelar edición
  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      nit_ci: user.nit_ci || "",
      zona: user.zona || "",
      calle: user.calle || "",
      numero_casa: user.numero_casa || "",
    });
  };

  return (
    <div className="ProfilePage">
      <div className="perfil-grid">
        <section className="perfil-card perfil-personal">
          <h2>Mi información personal</h2>

          <div className="perfil-row">
            <span>Nombre:</span> <strong>{user?.nombre || "—"}</strong>
          </div>
          <div className="perfil-row">
            <span>Correo:</span> <strong>{user?.email || "—"}</strong>
          </div>

          <h3>Datos de facturación</h3>

          {/* --- Campos editables --- */}
          <div className="perfil-row">
            <label>NIT / CI:</label>
            {editMode ? (
              <input
                name="nit_ci"
                value={formData.nit_ci}
                onChange={handleChange}
                placeholder="Ej. 12345678"
              />
            ) : (
              <strong>{user?.nit_ci || "—"}</strong>
            )}
          </div>

          <h3>Dirección</h3>
          {["zona", "calle", "numero_casa"].map((field) => (
            <div className="perfil-row" key={field}>
              <label>
                {field === "numero_casa"
                  ? "Nro Vivienda"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
                :
              </label>
              {editMode ? (
                <input
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Ingrese ${field}`}
                />
              ) : (
                <strong>{user?.[field] || "—"}</strong>
              )}
            </div>
          ))}

          {/* --- Botones de acción --- */}
          <div className="perfil-actions">
            {!editMode ? (
              <button
                type="button"
                className="btn-edit"
                onClick={() => setEditMode(true)}
              >
                ✏️ Editar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  💾 {saving ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  ❌ Cancelar
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
