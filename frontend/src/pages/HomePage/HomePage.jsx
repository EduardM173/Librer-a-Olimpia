import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import ProductCard from '../../components/ProductCard/ProductCard';

const heroImage = '/IMG/hero-banner.png'; 
const novedad1 = '/IMG/novedad-marmol.png';
const novedad2 = '/IMG/novedad-disenos.png';
const aboutImage = '/IMG/nosotros.png';
const ubiImage='/IMG/ic_ubi.png';
const calImage='/IMG/ic_calendario.png';
const autoImage='/IMG/ic_auto.png'

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
            <a href="#novedades" className="btn btn-secundario">Novedades</a>
          </div>
        </div>
      </section>

      {/* 2. Top Bar Section */}
      <section className="top-bar-section">
        <p>Las mejores marcas, la mejor calidad, todo para ti</p>
      </section>

      {/* 3. Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Nuestras Sucursales</h2>
          <p className="features-subtitle">Ubicanos en cualquiera de nuestras sucursales en toda La Paz</p>
          
          <div className="features-path">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <div className="icono">
                  <img src={ubiImage} alt="Ubicación" />
                </div>
              </div>
              <h3>Ubícanos</h3>
              <div className="feature-content-bubble">
                <ul>
                  <li>Ballivian</li>
                  <li>Handal</li>
                  <li>Mariscal</li>
                  <li>Calacoto</li>
                  <li>San Miguel</li>
                </ul>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <div className="icono">
                  <img src={calImage} alt="Calendario" />
                </div>
              </div>
              <h3>Agenda tu fecha</h3>
              <div className="feature-content-bubble">
                <p>Agenda tu fecha de visita y tu lista de materiales que necesitas</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <div className="icono">
                  <img src={autoImage} alt="Auto" />
                </div>
              </div>
              <h3>Pasa por la tienda</h3>
              <div className="feature-content-bubble">
                <p>Pasa por la tienda más cercana y realiza tu compra</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Novedades Section */}
      <section className="novedades-section" id="novedades">
        <div className="container">
          <h3>Novedades</h3>
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

      {/* 5. Acerca de Nosotros Section */}
      <section className="about-section">
        <div className="container">
          <h2>Acerca de Nosotros</h2>
              <p className="about-subtitle">
                Tenemos más de seis décadas de presencia en Bolivia. Y nos 
                expandimos con nuevas sucursales gracias a ti!!
              </p>
          <div className="about-content">
            
            {/* Columna Izquierda: Imagen */}
            <div className="about-image">
              <img src={aboutImage} alt="Acerca de Nosotros" />
            </div>

            {/* Columna Derecha: Texto y Features */}
            <div className="about-text">
              <div className="about-features">
                {/* --- Feature 1 --- */}
                <div className="about-feature-item">
                  <div className="about-feature-icon">
                    <span>📞</span> 
                  </div>
                  <div className="about-feature-text">
                    <h3>Atención personalizada</h3>
                    <p>Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices.</p>
                  </div>
                </div>

                {/* --- Feature 2 --- */}
                <div className="about-feature-item">
                  <div className="about-feature-icon">
                    <span>🚀</span> 
                  </div>
                  <div className="about-feature-text">
                    <h3>Mejor precio garantizado</h3>
                    <p>Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices.</p>
                  </div>
                </div>

                {/* --- Feature 3 --- */}
                <div className="about-feature-item">
                  <div className="about-feature-icon">
                    <span>📍</span> 
                  </div>
                  <div className="about-feature-text">
                    <h3>Diferentes locaciones</h3>
                    <p>Aliquam erat volutpat. Integer malesuada turpis id fringilla suscipit. Maecenas ultrices.</p>
                  </div>
                </div>

              </div>
            </div> 

          </div> 
        </div>
      </section>

      {/* 6. Catálogo Preview Section */}
      <section className="catalog-preview-section">
        <div className="container">
          <h2 className='catalog-title'>Catálogo</h2>
          <div className="catalog-tabs">
            <button className="active">Populares</button>
            <button>Bolígrafos</button>
            <button>Cuadernos</button>
            <button>Colores</button>
          </div>
          <div className="catalog-grid">
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