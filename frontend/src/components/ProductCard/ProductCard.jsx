import React from 'react';
import './ProductCard.css';
import { Link } from 'react-router-dom';

const ProductCard = ({ producto }) => {
  const item = producto || {
    id: 1,
    nombre: "Nombre Producto Ejemplo",
    precio: "10.00",
    imagen: "/IMG/placeholder-producto.jpg",
    agotado: false
  };

  const imagenSrc = item.imagen && item.imagen.trim() !== ""
    ? item.imagen
    : "/IMG/placeholder-producto.jpg";

  return (
    <div className="product-card">
      <Link to={`/producto/${item.id}`} className="product-image-link">
        <img src={imagenSrc} alt={item.nombre} />
      </Link>
      <div className="product-info">
        <h3 className="product-name">
          <Link to={`/producto/${item.id}`}>{item.nombre}</Link>
        </h3>
        <div className="product-price">
          {item.agotado ? (
            <span className="price-agotado">Agotado</span>
          ) : (
            <>
              <span className="price-final">Bs {item.precio}</span>
              <button className="add-to-cart-btn">
                Agregar al carrito
              </button>
            </>
          )}
        </div>
      </div>
      <button className="wishlist-btn">❤️</button>
    </div>
  );
};

export default ProductCard;
