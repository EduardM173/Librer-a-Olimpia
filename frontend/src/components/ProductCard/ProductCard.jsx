import React from 'react';
import './ProductCard.css';
import { Link } from 'react-router-dom';


const ProductCard = ({ producto }) => {
  // Datos de ejemplo si 'producto' no viene por props
  const item = producto || {
    id: 1,
    nombre: "Nombre Producto Ejemplo",
    precio: "10.00",
    imagen: "/IMG/placeholder-producto.jpg",
    agotado: false
  };

  return (
    <div className="product-card">
      <Link to={`/producto/${item.id}`} className="product-image-link">
        <img src={item.imagen} alt={item.nombre} />
      </Link>
      <div className="product-info">
        <h3 className="product-name">
          <Link to={`/producto/${item.id}`}>{item.nombre}</Link>
        </h3>
        <div className="product-price">
          {item.agotado ? (
            <span className="price-agotado">Agotado</span>
          ) : (
            <><span className="price-final">${item.precio}</span>
              <button className="add-to-cart-btn">
                Agregar al carrito
              </button></>
          )}
        </div>
      </div>
      <button className="wishlist-btn">
        {/* <FaRegHeart /> */} ❤️
      </button>
    </div>
  );
};

export default ProductCard;