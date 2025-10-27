// frontend/src/pages/ProfileLayout/ProfileLayout.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './ProfileLayout.css'; // si tienes estilos

const ProfileLayout = () => {
  return (
    <div className="profile-page-wrapper">
      <h1>Mi Perfil</h1>

      <div className="profile-content">
        {/* Sidebar */}
        <nav className="profile-sidebar">
          <Link to="/perfil/info" className="nav-item">Mi información personal</Link>
          <Link to="/perfil/pedidos" className="nav-item">Mis pedidos</Link>
          <Link to="/perfil/direccion" className="nav-item">Dirección</Link>
        </nav>

        {/* Contenido dinámico */}
        <div className="profile-section">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
