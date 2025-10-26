import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const isLogged = false; 

  return (
    <header className="navbar-fixed">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/IMG/logo.png" alt="Librería Olimpia" />
        </Link>

        {/* Navegación */}
        <nav className="navbar-nav">
          <Link to="/">Inicio</Link>
          <Link to="/about">Acerca de Nosotros</Link>
          <Link to="/catalogo">Catálogo</Link> {/* ✅ corregido (antes era /Catalog) */}
        </nav>

        {/* Menú de Usuario */}
        <div className="navbar-user-menu">
          {isLogged ? (
            <>
              <Link to="/mi-perfil" className="navbar-user-link">Hola, [Nombre]</Link>
              <Link to="/logout" className="navbar-user-link">Salir</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="register-link">Register</Link>
              <Link to="/login" className="btn-login">Login</Link>
            </>
          )}

          <Link to="/carrito" className="cart-link">
            <img src="/IMG/carrito.png" alt="Carrito" className="cart-icon" /> {/* ✅ no se importa, se usa por URL */}
            <span className="cart-count">0</span>
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
