// components/ProfileLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const ProfileLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800"> Mi Perfil</h1>

      <div className="flex w-full max-w-5xl bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* === Sidebar === */}
        <nav className="w-1/4 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white flex flex-col py-6 px-4 space-y-3">
          <Link
            to="/perfil/info"
            className={`nav-item px-4 py-3 rounded-lg transition-all duration-200 hover:bg-indigo-700 ${
              location.pathname.includes('/perfil/info')
                ? 'bg-indigo-700 font-semibold'
                : ''
            }`}
          >
            💼 Mi información personal
          </Link>
          <Link
            to="/perfil/pedidos"
            className={`nav-item px-4 py-3 rounded-lg transition-all duration-200 hover:bg-indigo-700 ${
              location.pathname.includes('/perfil/pedidos')
                ? 'bg-indigo-700 font-semibold'
                : ''
            }`}
          >
            📦 Mis pedidos
          </Link>
        </nav>

        {/* === Contenido dinámico === */}
        <div className="w-3/4 p-8 bg-gray-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
