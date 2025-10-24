import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import ProductCard from '../../components/ProductCard/ProductCard';

const heroImage = '/IMG/hero-banner.png'; 
const novedad1 = '/IMG/novedad-marmol.png';
const novedad2 = '/IMG/novedad-disenos.png';
const aboutImage = '/IMG/nosotros.png';


const HomePage = () => {
  return (
    <div className="homepage">
      {/* 1. Hero Section */}
      <section className="hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-content">
          <h1>Librería y papelería</h1>
          <h1>Olimpia</h1>
          <p>Comercialización de productos al consumidor final en nuestras cinco sucursales en la ciudad de La Paz</p>
          <div className="hero-buttons">
            <Link to="/catalogo" className="btn btn-primario">Ver catálogo</Link>
            <Link to="/sucursales" className="btn btn-secundario">Sucursales</Link>
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section className="features-section">
        <h2>Nuestras Sucursales</h2>
        <div className="features-grid">
          <div className="feature-item">
            {/* Reemplaza con íconos */}
            <span>📍</span> 
            <h3>Ubicación</h3>
            <p>Dos sucursales para tu comodidad.</p>
          </div>
          <div className="feature-item">
            <span>🛒</span>
            <h3>Agendá tu compra</h3>
            <p>Reserva online y retira en tienda.</p>
          </div>
          <div className="feature-item">
            <span>🚗</span>
            <h3>Retiro por ventanilla</h3>
            <p>Rápido, seguro y sin bajarte del auto.</p>
          </div>
        </div>
      </section>

      {/* 3. Novedades Section */}
      <section className="novedades-section">
        <div className="container">
          <h2>Novedades</h2>
          <div className="novedades-grid">
            <div className="novedad-card">
              <img src={novedad1} alt="Novedad 1" />
            </div>
            <div className="novedad-card">
              <img src={novedad2} alt="Novedad 2" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Acerca de Nosotros Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-image">
              <img src={aboutImage} alt="Acerca de Nosotros" />
            </div>
            <div className="about-text">
              <h2>Acerca de Nosotros</h2>
              <p>Tradición y calidad desde 1950. Ofrecemos la mayor variedad de productos...</p>
              <ul>
                <li><span>📞</span> Atención personalizada</li>
                <li><span>💰</span> Récord de precios bajos</li>
                <li><span>🏪</span> 2 sucursales</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Catálogo Preview Section */}
      <section className="catalog-preview-section">
        <div className="container">
          <h2>Catálogo</h2>
          <div className="catalog-tabs">
            <button className="active">Populares</button>
            <button>Hogar</button>
            <button>Cuadernos</button>
            <button>Random</button>
          </div>
          <div className="catalog-grid">
            {/* Aquí deberías hacer un "map" de tus productos de prueba */}
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
          </div>
          <div className="catalog-full-link">
            <Link to="/catalogo" className="btn btn-primario">Ver todo el catálogo</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;