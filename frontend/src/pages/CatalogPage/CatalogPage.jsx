import React, { useEffect, useMemo, useState } from 'react';
import './CatalogPage.css';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import ProductModal from '../../components/ProductModal/ProductModal.jsx';
import { getCategories, getProducts } from '../../services/productService';

export default function CatalogPage() {
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 12, total: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = useMemo(() => ([
    { key: 'popular', label: 'Popular', catId: null },
    ...categories.map(c => ({ key: 'cat-' + c.id, label: c.nombre, catId: c.id }))
  ]), [categories]);

  async function load(page = 1, cat = activeCat, search = searchTerm) {
    setLoading(true);
    try {
      const { items, meta } = await getProducts({
        page,
        pageSize: 12,
        categoryId: cat,
        search,
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

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    load(1, activeCat, searchTerm);
  }, [activeCat]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1, activeCat, searchTerm);
  };

  return (
    <div className="CatalogPage">
      <header className="catalogo-header">
        <h1>Catálogo</h1>
        <p>Explora nuestros productos. Haz clic para ver más detalles.</p>
        <form onSubmit={handleSearch} className="catalogo-search-form">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            id="buscar"
          />
          <button type="submit" className="search-btn">Buscar</button>
        </form>
      </header>

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

      <section className="catalogo-grid">
        {loading && <div className="catalogo-loading">Cargando…</div>}
        {!loading && list.length === 0 && <div className="catalogo-empty">Sin resultados.</div>}
        {!loading && list.map(prod => (
          <ProductCard
            key={prod.id}
            producto={prod}
            onSelect={() => setSelectedProduct(prod)}
          />
        ))}
      </section>

      <footer className="catalogo-footer">
        <span>Total productos: {meta.total}</span>
        <div className="pager">
          <button disabled={meta.page <= 1 || loading} onClick={() => load(meta.page - 1)}>
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

      {/* 🔹 Modal de producto */}
      {selectedProduct && (
        <ProductModal
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
