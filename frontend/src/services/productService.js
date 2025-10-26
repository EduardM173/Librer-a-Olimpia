const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// /api/categories -> el backend devuelve directamente un array de categorías
export async function getCategories() {
  const r = await fetch(`${API}/api/categories`);
  if (!r.ok) throw new Error('categories_http');
  // backend responde: [ { id, nombre }, ... ]
  return r.json();
}

// /api/products -> el backend devuelve directamente { items, meta }
export async function getProducts({ page=1, pageSize=12, categoryId=null, search='', sort='popular' } = {}) {
  const q = new URLSearchParams({
    page, pageSize, search, sort,
    ...(categoryId ? { categoryId } : {})
  });
  const r = await fetch(`${API}/api/products?${q.toString()}`);
  if (!r.ok) throw new Error('products_http');
  // backend responde: { items, meta }
  return r.json();
}

// (opcional) /api/products/:id si luego usas el detalle
export async function getProductById(id) {
  const r = await fetch(`${API}/api/products/${id}`);
  if (!r.ok) throw new Error('product_detail_http');
  return r.json(); // { id, nombre, precio, imagen, ... }
}
