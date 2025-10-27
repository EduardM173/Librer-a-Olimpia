import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, openLogin, openRegister, logout } = useAuth();
  const navigate = useNavigate();

  const goProfile = () => navigate('/perfil');

  return (
    <header className="navbar-fixed">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/IMG/logo.png" alt="Librería Olimpia" />
        </Link>

        <nav className="navbar-nav">
          <Link to="/">Inicio</Link>
          <Link to="/about">Acerca de Nosotros</Link>
          <Link to="/catalogo">Catálogo</Link>
        </nav>

        <div className="navbar-user-menu">
          {user ? (
            <>
              <button className="navbar-user-link btn-profile" onClick={goProfile}>
                Mi perfil
              </button>
              <button className="navbar-user-link btn-logout" onClick={logout}>
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

          <Link to="/carrito" className="cart-link">
            <img src="/IMG/carrito.png" alt="Carrito" className="cart-icon" />
            <span className="cart-count">0</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;