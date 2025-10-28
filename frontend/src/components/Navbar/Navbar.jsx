import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../../context/AuthContext";
import { isAdmin } from "../../utils/auth";

const Navbar = () => {
  const { user, openLogin, openRegister, logout } = useAuth();
  const navigate = useNavigate();
  const admin = isAdmin(user);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminRef = useRef(null);

  // Cierra el menú si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goProfile = () => navigate("/perfil");
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar-fixed">
      <div className="navbar-container">
        {/* 🔹 Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/IMG/logo.png" alt="Librería Olimpia" />
        </Link>

        {/* 🔹 Menú principal */}
        <nav className="navbar-nav">
          <Link to="/">Inicio</Link>
          <Link to="/about">Acerca de Nosotros</Link>
          <Link to="/catalogo">Catálogo</Link>
        </nav>

        {/* 🔹 Menú de usuario */}
        <div className="navbar-user-menu">
          {user ? (
            <>
              <span className="navbar-user-name">
                👤 {user.nombre || user.username}
              </span>

              {/* 🔹 Si es ADMIN, muestra botón desplegable */}
              {admin ? (
                <div className="admin-dropdown" ref={adminRef}>
                  <button
                    className="navbar-user-link btn-panel"
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  >
                    Admin ▾
                  </button>

                  {adminMenuOpen && (
                    <div className="admin-menu">
                      <Link to="/admin/productos" onClick={() => setAdminMenuOpen(false)}>
                        Productos
                      </Link>
                      <Link to="/admin/pedidos" onClick={() => setAdminMenuOpen(false)}>
                        Pedidos
                      </Link>
                      <Link to="/admin/clientes" onClick={() => setAdminMenuOpen(false)}>
                        Clientes
                      </Link>
                      <Link to="/admin/reportes" onClick={() => setAdminMenuOpen(false)}>
                        Reportes
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="navbar-user-link btn-profile"
                  onClick={goProfile}
                >
                  Mi perfil
                </button>
              )}

              <button
                className="navbar-user-link btn-logout"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <button className="register-link" onClick={openRegister}>
                Registrarse
              </button>
              <button className="btn-login" onClick={openLogin}>
                Iniciar sesión
              </button>
            </>
          )}

          {/* 🔹 Carrito (solo si no es admin) */}
          {!admin && (
            <Link to="/carrito" className="cart-link">
              <img src="/IMG/carrito.png" alt="Carrito" className="cart-icon" />
              <span className="cart-count">0</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
