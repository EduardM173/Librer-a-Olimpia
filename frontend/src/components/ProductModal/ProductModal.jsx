import React from "react";
import "./ProductModal.css";

const ProductModal = ({ producto, onClose }) => {
  if (!producto) return null;

  const imagenSrc =
    producto.imagen && producto.imagen.trim() !== ""
      ? producto.imagen
      : "/IMG/placeholder-producto.jpg";

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div
        className="product-modal-content"
        onClick={(e) => e.stopPropagation()} // evita cerrar si se hace clic dentro
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-body">
          <div className="modal-image">
            <img src={imagenSrc} alt={producto.nombre} />
          </div>

          <div className="modal-info">
            <h2>{producto.nombre}</h2>
            <p className="modal-description">
              {producto.descripcion || "Sin descripción disponible."}
            </p>

            <div className="modal-price">
              <strong>Precio:</strong> Bs {producto.precio}
            </div>

            {producto.agotado ? (
              <button className="btn-agotado" disabled>
                Agotado
              </button>
            ) : (
              <button className="btn-add-cart">Agregar al carrito</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
