import React, { useEffect, useMemo, useState } from 'react';
import './CatalogPage.css';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import { getCategories, getProducts } from '../../services/productService';

export default function CatalogPage() {
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 12, total: 0 });
  const [loading, setLoading] = useState(false);

  // pestañas: Popular + categorías reales
  const tabs = useMemo(() => ([
    { key: 'popular', label: 'Popular', catId: null },
    ...categories.map(c => ({ key: 'cat-' + c.id, label: c.nombre, catId: c.id }))
  ]), [categories]);

  // Carga de productos
  async function load(page = 1, cat = activeCat) {
    setLoading(true);
    try {
      const { items, meta } = await getProducts({
        page,
        pageSize: 12,
        categoryId: cat,
        sort: cat ? 'new' : 'popular'
      });
      setList(items);
      setMeta(meta);
    } catch (e) {
      console.error('Error cargando productos:', e);
    } finally {
      setLoading(false);
    }
  }

  // Cargar categorías al iniciar
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Cuando cambia la categoría, recarga productos
  useEffect(() => {
    load(1, activeCat);
  }, [activeCat]);

  return (
    <div className="CatalogPage">
      <header className="catalogo-header">
        <h1>Catálogo</h1>
        <p>Explora nuestros productos. Agrega al carrito desde aquí.</p>
      </header>

      {/* pestañas de categorías */}
      <nav className="catalogo-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${t.catId === activeCat ? 'active' : ''}`}
            onClick={() => setActiveCat(t.catId)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* grid de productos */}
      <section className="catalogo-grid">
        {loading && <div className="catalogo-loading">Cargando…</div>}
        {!loading && list.length === 0 && <div className="catalogo-empty">Sin resultados.</div>}
        {!loading && list.map(prod => (
          <ProductCard key={prod.id} producto={prod} />
        ))}
      </section>

      {/* footer con total y paginación */}
      <footer className="catalogo-footer">
        <span>Total productos: {meta.total}</span>
        <div className="pager">
          <button
            disabled={meta.page <= 1 || loading}
            onClick={() => load(meta.page - 1)}
          >
            Anterior
          </button>

          <span>Página {meta.page}</span>

          <button
            disabled={meta.page * meta.pageSize >= meta.total || loading}
            onClick={() => load(meta.page + 1)}
          >
            Siguiente
          </button>
        </div>
      </footer>
    </div>
  );
}
