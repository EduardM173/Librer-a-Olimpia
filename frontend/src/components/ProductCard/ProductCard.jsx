import React from 'react';
import './ProductCard.css';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ producto, onSelect }) => {
  const { addItem } = useCart();

  const item = producto || {
    id: 1,
    nombre: "Nombre Producto Ejemplo",
    precio: "10.00",
    imagen: "/IMG/placeholder-producto.jpg",
    agotado: false,
  };

  const imagenSrc =
    item.imagen && item.imagen.trim() !== ""
      ? item.imagen
      : "/IMG/placeholder-producto.jpg";

  const handleAddToCart = (e) => {
    e.stopPropagation(); // evita abrir el modal de detalle
    addItem(item, 1);
  };

  return (
    <div
      className="product-card"
      onClick={() => onSelect && onSelect(item)}
      role="button"
    >
      <div className="product-image-link">
        <img src={imagenSrc} alt={item.nombre} />
      </div>

      <div className="product-info">
        <h3 className="product-name">{item.nombre}</h3>

        <div className="product-price">
          {item.agotado ? (
            <span className="price-agotado">Agotado</span>
          ) : (
            <>
              <span className="price-final">Bs {Number(item.precio).toFixed(2)}</span>
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                Agregar al carrito
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
