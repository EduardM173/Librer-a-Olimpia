import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import AboutPage from './pages/AboutPage/AboutPage.jsx';
import CatalogPage from './pages/CatalogPage/CatalogPage.jsx';  // ← agregado
import './App.css'; 

//Componentes de los pedidos
import OrdersList from './pages/OrdersPage/OrdersList'; 
import OrderDetail from './pages/OrdersPage/OrderDetail'; 
import ProfileLayout from './pages/ProfileLayout/ProfileLayout.jsx';
//Componentes de los reportes de ventas Admin
import AdminReports from './pages/AdminReports/AdminReports.jsx';
import AdminLayout from './pages/AdminLayout/AdminLayout.jsx';


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />  {/* ← agregado */}

          {/* Rutas para los pedidos */}

          {/* Rutas Protegidas dentro de la sección de Perfil */}
        <Route path="/perfil" element={<ProfileLayout />}> 
            {/* ... Otras rutas de perfil (Datos, Dirección, etc.) ... */}
            
            {/* Ruta para la lista de pedidos */}
            <Route 
              path="pedidos" 
              element={<OrdersList />} 
            /> 
            
            {/* Ruta para el detalle del pedido. El ':id' captura el ID */}
            <Route 
              path="pedidos/:id" 
              element={<OrderDetail />} 
            /> 
        </Route>

        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
