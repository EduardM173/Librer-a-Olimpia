import React, { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [modals, setModals] = useState({ login: false, register: false });

  // =========================================================
  // Cargar datos guardados al iniciar
  // =========================================================
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("auth_user");
      const storedToken = localStorage.getItem("auth_token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Error cargando auth:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // Guardar cambios de usuario/token en localStorage
  // =========================================================
  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  }, [token]);

  // =========================================================
  // Funciones de modales
  // =========================================================
  const openLogin = () => setModals({ login: true, register: false });
  const openRegister = () => setModals({ login: false, register: true });
  const closeModals = () => setModals({ login: false, register: false });

  // =========================================================
  // LOGIN / LOGOUT
  // =========================================================
  const login = (u, t) => {
    setUser(u);
    setToken(t);
    closeModals();
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch("http://localhost:3000/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Error al registrar el logout en el backend:", error);
    } finally {
      setUser(null);
      setToken("");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }
  };

  // =========================================================
  // 🔄 REFRESCAR DATOS DEL USUARIO (si el token sigue válido)
  // =========================================================
  async function refreshUserData() {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:3000/api/clientes/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudo refrescar el perfil del cliente.");

      const fresh = await res.json();
      setUser((prev) => ({ ...prev, ...fresh }));
      localStorage.setItem("auth_user", JSON.stringify({ ...user, ...fresh }));
      return fresh;
    } catch (err) {
      console.warn("⚠️ Token inválido o sesión expirada.");
      logout();
    }
  }

  // =========================================================
  // Proveer valores al contexto
  // =========================================================
  return (
    <Ctx.Provider
      value={{
        user,
        setUser, // ✅ Nuevo: permite actualización desde ProfilePage
        token,
        loading,
        login,
        logout,
        refreshUserData, // ✅ Nuevo: útil para forzar actualización en cualquier vista
        modals,
        openLogin,
        openRegister,
        closeModals,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
