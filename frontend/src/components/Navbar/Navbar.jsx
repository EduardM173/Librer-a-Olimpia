// frontend/src/components/Navbar/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import cartIcon from '../../../public/IMG/carrito.png'; 

const Navbar = () => {
  // h01
  const isLogged = false; 
  return (
    <header className="navbar-fixed">
      <div className="navbar-container">
        
        {/*Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/IMG/logo.png" alt="Librería Olimpia" />
        </Link>

        {/*Links de Navegación */}
        <nav className="navbar-nav">
          <Link to="/">Inicio</Link>
          <Link to="/about">Acerca de Nosotros</Link>
          <Link to="/catalogo">Catálogo</Link>
        </nav>

        {/*Menú de Usuario */}
        <div className="navbar-user-menu">
          {isLogged ? (
            // LOGUEADO
            <>
              <Link to="/mi-perfil" className="navbar-user-link">Hola, [Nombre]</Link>
              <Link to="/logout" className="navbar-user-link">Salir</Link>
            </>
          ) : (
            // ANÓNIMO
            <>
              <Link to="/register" className="register-link">Register</Link>
              <Link to="/login" className="btn-login">Login</Link>
            </>
          )}

          <Link to="/carrito" className="cart-link">
            <img src={cartIcon} alt="Carrito" className="cart-icon" />
            <span className="cart-count">0</span>
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Navbar;