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
              <img src="/IMG/logo.png" alt="Librería Olimpia" />
            </Link>
            <div className="footer-socials">
              <a href="https://www.facebook.com/share/1GjYhrcFcA/"><img src="/IMG/ic_facebook.png" alt="FB" /></a>
              <a href="https://www.instagram.com/libreriaolimpia?igsh=NGU5N3pkaHBpeGFn"><img src="/IMG/ic_instagram.png" alt="IG" /></a>
              <a href="https://www.tiktok.com/@libreriaolimpia?_t=ZM-90h8gnvG9hw&_r=1"><img src="/IMG/ic_tiktok.png" alt="TK" /></a>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div className="footer-col">
            <h3>Navegación</h3>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/about">Acerca de Nosotros</Link></li>
              <li><Link to="/catalogo">Catálogo</Link></li>
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
            <h3>Redes Sociales</h3>
            <ul>
              <li><a href="https://www.facebook.com/share/1GjYhrcFcA/">Facebook</a></li>
              <li><a href="https://www.instagram.com/libreriaolimpia?igsh=NGU5N3pkaHBpeGFn">Instagram</a></li>
              <li><a href="https://www.tiktok.com/@libreriaolimpia?_t=ZM-90h8gnvG9hw&_r=1">Tik Tok</a></li>
              <li>76753237</li>
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