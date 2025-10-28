import React from "react";
import "./CartPage.css";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";

const money = (n) => `Bs ${Number(n).toFixed(2)}`;

export default function CartPage() {
  const { items, total, updateQty, removeItem, clear } = useCart();

  const inc = (id) => {
    const item = items.find((x) => x.id === id);
    if (item) updateQty(id, item.qty + 1);
  };

  const dec = (id) => {
    const item = items.find((x) => x.id === id);
    if (item) updateQty(id, Math.max(item.qty - 1, 1));
  };

  return (
    <div className="cart-page">
      <header className="cart-header">
        <h1>🛒 TU CARRITO</h1>
        <p>Revisa tus productos antes de finalizar la compra.</p>
      </header>

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Tu carrito está vacío.</p>
          <a href="/catalogo" className="btn-go-shop">Ver catálogo</a>
        </div>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="cell-product">
                    <img src={it.imagen} alt={it.nombre} />
                    <span>{it.nombre}</span>
                  </td>
                  <td>{money(it.precio)}</td>
                  <td className="cell-qty">
                    <button onClick={() => dec(it.id)}>-</button>
                    <input
                      type="number"
                      min="1"
                      value={it.qty}
                      onChange={(e) =>
                        updateQty(it.id, parseInt(e.target.value || "1", 10))
                      }
                    />
                    <button onClick={() => inc(it.id)}>+</button>
                  </td>
                  <td>{money(it.precio * it.qty)}</td>
                  <td>
                    <button
                      className="btn-remove"
                      onClick={() => removeItem(it.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{money(total)}</strong>
            </div>

            <div className="summary-actions">
              <button className="btn-clear" onClick={clear}>
                Vaciar carrito
              </button>
              <Link to="/checkout" className="btn-pay">FINALIZAR COMPRA</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
