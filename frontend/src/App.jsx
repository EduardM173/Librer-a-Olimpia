// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

import AuthProvider, { useAuth } from './context/AuthContext';
import CartProvider from './context/CartContext';
import CartModal from './components/Cart/CartModal';

import LoginModal from './components/Auth/LoginModal';
import RegisterModal from './components/Auth/RegisterModal';

import HomePage from './pages/HomePage/HomePage';
import AboutPage from './pages/AboutPage/AboutPage.jsx';
import CatalogPage from './pages/CatalogPage/CatalogPage.jsx';
import CartPage from './pages/CartPage/CartPage.jsx';

import ProfilePage from './pages/ProfilePage/ProfilePage.jsx';
import ProfileLayout from './pages/ProfileLayout/ProfileLayout.jsx';

import PedidosAdmin from './pages/PedidosAdmin/PedidosAdmin';
import ClienteAdmin from './pages/ClienteAdmin/ClienteAdmin';

import OrdersList from './pages/OrdersPage/OrdersList';
import OrderDetail from './pages/OrdersPage/OrderDetail';

import { isAdmin } from './utils/auth.js';



import './App.css';

/* ============================
   COMPONENTE: Placeholder Dirección
============================ */
function AddressPanel() {
  return (
    <div>
      <h2>Dirección</h2>
      <p>Pendiente de implementar.</p>
    </div>
  );
}

/* ============================
   GUARDS DE AUTENTICACIÓN
============================ */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin(user)) return <Navigate to="/" replace />;
  return children;
}

/* ============================
   SHELL PRINCIPAL DE LA APP
============================ */
function AppShell() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <>
      {/* 🔹 Navbar único que adapta opciones según el tipo de usuario */}
      <Navbar />

      {/* 🔹 Modales globales */}
      <LoginModal />
      <RegisterModal />
      <CartModal />

      {/* 🔹 Contenido principal */}
      <main>
        <Routes>
          {/* === PÁGINAS PÚBLICAS === */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/carrito" element={<CartPage />} />

          {/* === RUTAS DE ADMIN (PROTEGIDAS) === */}
          <Route
            path="/admin/pedidos"
            element={
              <RequireAdmin>
                <PedidosAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/clientes"
            element={
              <RequireAdmin>
                <ClienteAdmin />
              </RequireAdmin>
            }
          />

          {/* === PERFIL DE USUARIO (PROTEGIDO) === */}
          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <ProfileLayout />
              </RequireAuth>
            }
          >
            <Route index element={<ProfilePage />} />
            <Route path="info" element={<ProfilePage />} />
            <Route path="pedidos" element={<OrdersList />} />
            <Route path="pedidos/:id" element={<OrderDetail />} />
            <Route path="direccion" element={<AddressPanel />} />
          </Route>

          {/* === RUTA POR DEFECTO === */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

/* ============================
   RAÍZ DE LA APLICACIÓN
============================ */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
