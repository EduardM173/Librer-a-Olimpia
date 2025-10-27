// components/ProfileLayout.jsx

import React from 'react';
import { Link, Outlet } from 'react-router-dom';

// El Outlet es la clave: es donde React Router inyecta el componente hijo (OrdersList o OrderDetail)
const ProfileLayout = () => {
  return (
    <div className="profile-page-wrapper">
      
      <h1>Mi Perfil</h1> 
      
      <div className="profile-content">
        
        {/* === A. El Menú de Navegación del Perfil (Parte estática) === */}
        <nav className="profile-sidebar">
          <Link to="/perfil/info" className="nav-item">Mi información personal</Link>
          <Link to="/perfil/pedidos" className="nav-item">Mis pedidos</Link> 
          <Link to="/perfil/direccion" className="nav-item">Dirección</Link>
        </nav>
        
        {/* === B. El Contenido Dinámico (Sección variable) === */}
         <div className="profile-section">
          {/* Aquí se renderiza el componente actual de la ruta (OrdersList o OrderDetail)*/} 
          <Outlet /> 
        </div> 

      </div>
    </div>
  );
};

export default ProfileLayout;