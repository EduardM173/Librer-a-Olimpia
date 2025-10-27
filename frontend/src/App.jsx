import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import AboutPage from './pages/AboutPage/AboutPage.jsx';
import CatalogPage from './pages/CatalogPage/CatalogPage.jsx';
import AuthProvider, { useAuth } from './context/AuthContext';
import LoginModal from './components/Auth/LoginModal';
import RegisterModal from './components/Auth/RegisterModal';



import ProfilePage from './pages/ProfilePage/ProfilePage.jsx';
import './App.css';

//Componentes de los pedidos
import OrdersList from './pages/OrdersPage/OrdersList'; 
import OrderDetail from './pages/OrdersPage/OrderDetail'; 


import ProfileLayout from './pages/ProfileLayout/ProfileLayout.jsx';

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <LoginModal />
        <RegisterModal />
        <main>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />  {/* ← agregado */}
        <Route
              path="/perfil"
              element={
                <RequireAuth>
                  <ProfileLayout />
                </RequireAuth>
              }
            />
            <Route 
              path="pedidos" 
              element={<OrdersList />} 
            /> 
            
            {/* Ruta para el detalle del pedido. El ':id' captura el ID */}
            <Route 
              path="pedidos/:id" 
              element={<OrderDetail />} 
            /> 
        

        </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
