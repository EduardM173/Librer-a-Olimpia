// frontend/src/components/Navbar/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import cartIcon from '../../../public/IMG/carrito.png'; 

const Navbar = () => {
  // Estado temporal para el estado de login.
  // Más adelante, esto vendrá de un Context (HU-01).
  const isLogged = false; 

  return (
    <header className="navbar-fixed">
      <div className="navbar-container">
        
        {/* Lado Izquierdo: Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/logo-olimpia.png" alt="Librería Olimpia" />
          {/* Asegúrate de poner tu logo-olimpia.png en la carpeta /public */}
        </Link>

        {/* Centro: Links de Navegación */}
        <nav className="navbar-nav">
          <Link to="/">Inicio</Link>
          <Link to="/about">Acerca de Nosotros</Link>
          <Link to="/catalogo">Catálogo</Link>
        </nav>

        {/* Lado Derecho: Menú de Usuario */}
        <div className="navbar-user-menu">
          {isLogged ? (
            // --- ESTADO LOGUEADO (para HUs futuras) ---
            <>
              <Link to="/mi-perfil" className="navbar-user-link">Hola, [Nombre]</Link>
              <Link to="/logout" className="navbar-user-link">Salir</Link>
            </>
          ) : (
            // --- ESTADO ANÓNIMO (como en tu mockup) ---
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