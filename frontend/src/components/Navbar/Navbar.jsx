import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../../context/AuthContext";
import { isAdmin } from "../../utils/auth";
import { useCart } from "../../context/CartContext";

const Navbar = () => {
  const { user, openLogin, openRegister, logout } = useAuth();
  const { count, setIsOpen } = useCart(); // ← usamos count (nº items) y setIsOpen
  const navigate = useNavigate();
  const admin = isAdmin(user);

  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminRef = useRef(null);

  // Cierra el menú Admin si se hace clic fuera
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

  const openCart = () => setIsOpen(true); // helper para abrir el modal

  return (
    <header className="navbar-fixed">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="Inicio">
          <img src="/IMG/logo.png" alt="Librería Olimpia" />
        </Link>

        {/* Menú principal */}
        <nav className="navbar-nav">
          <Link to="/">Inicio</Link>
          <Link to="/about">Acerca de Nosotros</Link>
          <Link to="/catalogo">Catálogo</Link>
        </nav>

        {/* Menú de usuario */}
        <div className="navbar-user-menu">
          {user ? (
            <>
              <span className="navbar-user-name">
                👤 {user.nombre || user.username}
              </span>

              {/* Admin: botón desplegable */}
              {admin ? (
                <div className="admin-dropdown" ref={adminRef}>
                  <button
                    className="navbar-user-link btn-panel"
                    onClick={() => setAdminMenuOpen((v) => !v)}
                    aria-expanded={adminMenuOpen}
                    aria-haspopup="menu"
                  >
                    Admin ▾
                  </button>

                  {adminMenuOpen && (
                    <div className="admin-menu" role="menu">
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
                <button className="navbar-user-link btn-profile" onClick={goProfile}>
                  Mi perfil
                </button>
              )}

              <button className="navbar-user-link btn-logout" onClick={handleLogout}>
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

          {/* Carrito (solo clientes/visitantes) */}
          {!admin && (
            <button
              type="button"
              className="cart-link"
              onClick={openCart}
              aria-label={`Abrir carrito. ${count} artículo(s)`}
              title="Abrir carrito"
            >
              <img src="/IMG/carrito.png" alt="Carrito" className="cart-icon" />
              {count > 0 && <span className="cart-count">{count}</span>}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
