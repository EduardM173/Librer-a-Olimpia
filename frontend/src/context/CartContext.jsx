import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // ✅ Cargar carrito desde localStorage al iniciar
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart_items");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  // 💾 Sincronizar cambios del carrito
  useEffect(() => {
    try {
      localStorage.setItem("cart_items", JSON.stringify(items));
    } catch (err) {
      console.warn("No se pudo guardar el carrito:", err);
    }
  }, [items]);

  // 🛒 Agregar al carrito
  const addItem = (p, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const clone = [...prev];
        clone[i] = { ...clone[i], qty: clone[i].qty + qty };
        return clone;
      }
      return [
        ...prev,
        {
          id: p.id,
          nombre: p.nombre,
          precio: Number(p.precio),
          imagen: p.imagen || "/IMG/placeholder-producto.jpg",
          qty,
        },
      ];
    });
  };

  // ❌ Quitar producto
  const removeItem = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  // 🔄 Actualizar cantidad
  const updateQty = (id, qty) =>
    setItems((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, qty: Math.max(parseInt(qty) || 1, 1) } : x
      )
    );

  // 🧹 Vaciar carrito
  const clear = () => {
    setItems([]);
    localStorage.removeItem("cart_items");
  };

  // 💰 Totales
  const total = items.reduce((sum, x) => sum + Number(x.precio) * Number(x.qty), 0);
  const count = items.reduce((sum, x) => sum + Number(x.qty), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clear,
        total,
        count,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
