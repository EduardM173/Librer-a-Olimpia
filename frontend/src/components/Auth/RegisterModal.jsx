import React, { useState } from "react";
import Modal from "../Modal/Modal";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2/dist/sweetalert2.all.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function RegisterModal() {
  const { modals, closeModals, openLogin, login } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");

  async function onSubmit(e) {
    e.preventDefault();

    // === Validaciones con SweetAlert2 ===
    if (nombre.trim().length < 3) {
      Swal.fire({
        icon: "warning",
        title: "Nombre inválido",
        text: "El nombre debe tener al menos 3 caracteres.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Correo no válido",
        text: "Por favor ingresa un correo electrónico correcto.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (password !== repeat) {
      Swal.fire({
        icon: "error",
        title: "Contraseñas no coinciden",
        text: "Asegúrate de escribir la misma contraseña dos veces.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      Swal.fire({
        icon: "info",
        title: "Contraseña débil",
        html: `
          <p>Debe tener al menos:</p>
          <ul style="text-align:left; margin:8px 0 0 20px;">
            <li>8 caracteres</li>
            <li>Una letra mayúscula</li>
            <li>Una letra minúscula</li>
            <li>Un número</li>
          </ul>`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      const r = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });

      const j = await r.json();

      if (!r.ok) {
        Swal.fire({
          icon: "error",
          title: "No se pudo registrar",
          text: j.message || "Hubo un error al registrarse. Intenta nuevamente.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // ✅ Registro exitoso
      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "Tu cuenta fue creada correctamente. Iniciando sesión...",
        showConfirmButton: false,
        timer: 2000,
      });

      // Auto login tras registro
      login(j.user, j.token);
      closeModals();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        confirmButtonColor: "#d33",
      });
    }
  }

  return (
    <Modal open={modals.register} onClose={closeModals}>
      <h2>Crear una cuenta</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Tu nombre completo"
          />
        </div>
        <div>
          <label>Correo electrónico</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="ejemplo@correo.com"
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            placeholder="********"
          />
        </div>
        <div>
          <label>Repetir contraseña</label>
          <input
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            type="password"
            required
            placeholder="********"
          />
        </div>

        <div className="modal-actions">
          <button className="modal-btn" type="submit">
            Registrarse
          </button>
        </div>

        <p className="modal-note">
          ¿Ya tienes cuenta?{" "}
          <button type="button" className="modal-link" onClick={openLogin}>
            Iniciar Sesión
          </button>
        </p>
      </form>
    </Modal>
  );
}
