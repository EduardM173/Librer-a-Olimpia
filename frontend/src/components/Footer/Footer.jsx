import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" className="footer-logo">
              <img src="/logo-olimpia-blanco.png" alt="Librería Olimpia" />
            </Link>
            <div className="footer-socials">
              <a href="#">FB</a>
              <a href="#">IG</a>
              <a href="#">TT</a>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div className="footer-col">
            <h3>Navegación</h3>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/catalogo">Catálogo</Link></li>
              <li><Link to="/ofertas">Ofertas</Link></li>
              <li><Link to="/about">Acerca de Nosotros</Link></li>
            </ul>
          </div>

          {/* Columna 3: Mi Perfil */}
          <div className="footer-col">
            <h3>Mi Perfil</h3>
            <ul>
              <li><Link to="/login">Iniciar Sesión</Link></li>
              <li><Link to="/register">Registrarse</Link></li>
              <li><Link to="/pedidos">Mis Pedidos</Link></li>
              <li><Link to="/carrito">Mi Carrito</Link></li>
            </ul>
          </div>

          {/* Columna 4: Ayuda */}
          <div className="footer-col">
            <h3>Ayuda</h3>
            <ul>
              <li><Link to="/contacto">Contacto</Link></li>
              <li><Link to="/faq">Preguntas Frecuentes</Link></li>
              <li><Link to="/sucursales">Sucursales</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Librería Olimpia. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;