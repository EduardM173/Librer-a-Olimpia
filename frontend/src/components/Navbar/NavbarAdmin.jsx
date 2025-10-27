import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../context/AuthContext';

const NavbarAdmin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar-fixed">
      <div className="navbar-container">
        {/* 🔹 Logo a la izquierda */}
        <Link to="/" className="navbar-logo">
          <img src="/IMG/logo.png" alt="Librería Olimpia" />
        </Link>

        {/* 🔹 Menú principal */}
        <nav className="navbar-nav">
          <Link to="/admin/productos">Productos</Link>
          <Link to="/admin/pedidos">Pedidos</Link>
          <Link to="/admin/reportes">Reportes</Link>
          <Link to="/admin/clientes">Clientes</Link>
        </nav>

        {/* 🔹 Info del administrador */}
        <div className="navbar-user-menu">
          {user && (
            <div className="admin-info">
              <span className="admin-nombre">👤 {user.nombre || 'Administrador'}</span>
            </div>
          )}
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavbarAdmin;
