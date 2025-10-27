import React from "react";
import "./Cart.css";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";

const money = (n) => `Bs ${Number(n).toFixed(2)}`;

export default function CartModal() {
  const { isOpen, setIsOpen, items, total, updateQty, removeItem } = useCart();

  if (!isOpen) return null;

  const closeCart = () => setIsOpen(false);

  const inc = (id) => {
    const it = items.find((x) => x.id === id);
    if (it) updateQty(id, it.qty + 1);
  };

  const dec = (id) => {
    const it = items.find((x) => x.id === id);
    if (it) updateQty(id, Math.max(it.qty - 1, 1));
  };

  return (
    <div className="cart-overlay" onClick={closeCart}>
      <aside className="cart-panel" onClick={(e) => e.stopPropagation()}>
        <header className="cart-header">
          <h2>TU CARRITO</h2>
          <button className="cart-close" onClick={closeCart} aria-label="Cerrar">✕</button>
        </header>

        <div className="cart-list">
          {items.length === 0 ? (
            <p className="cart-empty">Tu carrito está vacío.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-row">
                <img src={item.imagen} alt={item.nombre} />
                <div className="cart-info">
                  <div className="cart-name">{item.nombre}</div>
                  <div className="cart-price">{money(item.precio)}</div>
                </div>
                <div className="cart-qty">
                  <button onClick={() => dec(item.id)} aria-label="Disminuir">-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => inc(item.id)} aria-label="Aumentar">+</button>
                </div>
                <button
                  className="cart-remove"
                  onClick={() => removeItem(item.id)}
                  aria-label="Quitar"
                  title="Quitar del carrito"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        <footer className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          <Link to="/carrito" className="cart-checkout" onClick={closeCart}>
            FINALIZAR COMPRA
          </Link>
        </footer>
      </aside>
    </div>
  );
}
