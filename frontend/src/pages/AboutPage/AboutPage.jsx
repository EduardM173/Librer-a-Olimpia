import React from 'react';
import './AboutPage.css';

const historyImage = '/IMG/nosotros1.png'; 
const AboutPage = () => {
  return (
    <div className="about-page">
      
      {/* --- Sección de Misión y Visión --- */}
      <section className="mv-section">
        <div className="container">
          <h1 className="mv-title">Acerca de Nosotros</h1>
          
          <div className="mv-grid">
            {/* --- Misión --- */}
            <div className="mv-card">
              <h2 className="mv-card-title">Misión</h2>
              <div className="mv-card-content">
                <p>Ofrecemos soluciones de alto valor en los segmentos Retail, Institucional e Intermediario, mediante la fabricación, comercialización y distribución de productos a nivel nacional, con visión de liderazgo en el mercado.</p>
              </div>
            </div>

            {/* --- Visión --- */}
            <div className="mv-card">
              <h2 className="mv-card-title">Visión</h2>
              <div className="mv-card-content">
                <p>Ser la primera elección de nuestros clientes y el referente de excelencia e innovación en Retail, Institucional e Intermediario, promoviendo una cultura de mejora continua que nos mantenga a la vanguardia del mercado.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Sección de Nuestra Historia --- */}
      <section className="history-section">
        <div className="container">
          <h2 className="history-title">Nuestra Historia</h2>
          <div className="history-content">
            
            {/* Columna Izquierda: Imagen */}
            <div className="history-image">
              <img src={historyImage} alt="Historia de Librería Olimpia" />
            </div>

            {/* Columna Derecha: Texto */}
            <div className="history-text">
              <p>Librería y Papelería Olimpia más de seis décadas de presencia en Bolivia. Fundada el 29 de julio de 1959 por Alfred Weinberg y Flora Jáuregui.</p>
              <p>Iniciamos en un pequeño local en la calle Ingavi N° 1024 y luego nos trasladamos al N° 1051, ampliando nuestro alcance.</p>
              <p>Durante los años nos fuimos expandiendo con nuevas sucursales, incursionando en importaciones, y en décadas recientes fortalecimos nuestro contacto con las redes sociales.</p>
              <p className="history-signoff">Te esperamos!!</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;