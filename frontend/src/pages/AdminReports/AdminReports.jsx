import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminReports.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE_URL = 'http://localhost:3000/api/admin/reportes';

// --- COMPONENTE: Gráfico de productos filtrados por categoría ---
const FilteredProductsChart = ({ title, products }) => {
  const data = {
    labels: products.map(p =>
      p.nombre.length > 20 ? p.nombre.substring(0, 20) + '...' : p.nombre
    ),
    datasets: [
      {
        label: 'Cantidad Vendida (Unidades)',
        data: products.map(p => p.cantidadVendida),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title },
      tooltip: {
        callbacks: {
          label: context => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            const totalImporte = products[context.dataIndex].importeTotal;
            label += `${context.raw} unidades (Bs ${totalImporte})`;
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        title: { display: true, text: 'Unidades Vendidas' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-container">
      {products.length > 0 ? (
        <Bar options={options} data={data} />
      ) : (
        <div className="chart-placeholder-empty">
          <p>Seleccione una categoría o no hay datos para el rango seleccionado.</p>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------

const AdminReports = () => {
  const { token } = useAuth();

  // --- ESTADOS ---
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const [kpiStats, setKpiStats] = useState({
    ventas: 0,
    pedidos: 0,
    ticketPromedio: 0,
    ganancia: 0,
  });

  const [topProductsGeneral, setTopProductsGeneral] = useState([]);
  const [salesChartData, setSalesChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [topProductsFiltered, setTopProductsFiltered] = useState([]);

  // HU2: datos de Stock Crítico + Valoración
  const [lowStockData, setLowStockData] = useState({
    threshold: 5,
    totalUnidades: 0,
    totalValor: 0,
    productos: [],
  });

  // HU2: texto de búsqueda (filtro por nombre / SKU)
  const [lowStockSearch, setLowStockSearch] = useState('');

  // ---------------------- FUNCIONES ---------------------------

  const fetchData = async () => {
    try {
      const { start, end } = dateRange;

      // A) KPIs financieros
      const summaryRes = await fetch(
        `${API_BASE_URL}/summary?fechaInicio=${start}&fechaFin=${end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setKpiStats({
          ventas: Number(summaryData.ventas) || 0,
          pedidos: Number(summaryData.pedidos) || 0,
          ticketPromedio: Number(summaryData.ticketPromedio) || 0,
          ganancia: Number(summaryData.ganancia) || 0,
        });
      }

      // B) Top productos general
      const topGeneralRes = await fetch(
        `${API_BASE_URL}/top-productos?fechaInicio=${start}&fechaFin=${end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (topGeneralRes.ok) {
        const topGeneralData = await topGeneralRes.json();
        setTopProductsGeneral(topGeneralData);

        setSalesChartData({
          labels: topGeneralData.map(
            p => p.nombre.substring(0, 15) + (p.nombre.length > 15 ? '...' : '')
          ),
          datasets: [
            {
              label: 'Cantidad Vendida (General)',
              data: topGeneralData.map(p => p.cantidadVendida),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        });
      }

      // C) Top productos filtrado por categoría
      if (selectedCategoryId) {
        const topFilteredRes = await fetch(
          `${API_BASE_URL}/top-productos?fechaInicio=${start}&fechaFin=${end}&categoriaId=${selectedCategoryId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (topFilteredRes.ok) {
          const topFilteredData = await topFilteredRes.json();
          setTopProductsFiltered(topFilteredData);
        } else {
          setTopProductsFiltered([]);
        }
      } else {
        setTopProductsFiltered([]);
      }

      // D) HU2 – Stock crítico (traemos TODO; filtramos por categoría en frontend)
      const lowStockRes = await fetch(`${API_BASE_URL}/stock-critico`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (lowStockRes.ok) {
        const lowData = await lowStockRes.json();
        setLowStockData({
          threshold: lowData.threshold,
          totalUnidades: lowData.totalUnidades,
          totalValor: lowData.totalValor,
          productos: lowData.productos || [],
        });
      } else {
        console.warn('No se pudo obtener el reporte de stock crítico');
        setLowStockData(prev => ({
          ...prev,
          totalUnidades: 0,
          totalValor: 0,
          productos: [],
        }));
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
    }
  };

  const handleDateChange = e => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = e => {
    setSelectedCategoryId(e.target.value);
  };

  const handleExportCsv = () => {
    const { start, end } = dateRange;

    let url = `${API_BASE_URL}/top-productos?fechaInicio=${start}&fechaFin=${end}&format=csv`;
    if (selectedCategoryId) url += `&categoriaId=${selectedCategoryId}`;

    fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        if (!response.ok)
          throw new Error('Error al descargar el CSV: ' + response.statusText);

        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `reporte_${start}_a_${end}.csv`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        return response.blob().then(blob => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Fallo la descarga del CSV:', error);
        alert('Error al exportar el reporte a CSV. Verifique las fechas.');
      });
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Top 10 Productos Más Vendidos (General)' },
    },
  };

  const categoryName =
    categories.find(c => String(c.id) === String(selectedCategoryId))?.nombre ||
    'General';

  // ----------------------- EFECTOS -----------------------------

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;

      try {
        const categoryRes = await fetch('http://localhost:3000/api/categories', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          setCategories(categoryData);
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    };

    fetchCategories();
  }, [token]);

  useEffect(() => {
    if (token) fetchData();
  }, [token, dateRange, selectedCategoryId]);

  // ------------------- FILTRO PARA HU-002 (categoría + texto) -----

  const filteredLowStockProducts = (lowStockData.productos || []).filter(p => {
    // 1) Filtro por categoría (de arriba)
    const matchCategory =
      !selectedCategoryId ||
      (p.categoriaId && String(p.categoriaId) === String(selectedCategoryId));

    // 2) Filtro por texto (nombre/SKU)
    const term = lowStockSearch.trim().toLowerCase();
    const matchSearch =
      !term ||
      p.nombre.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term);

    return matchCategory && matchSearch;
  });

  // ------------------------ RENDER -----------------------------

  return (
    <div className="admin-reports-layout">
      <main className="admin-main-content">
        <header className="admin-header-simple">
          <h1>Dashboard Gerencial (DSS) 📊</h1>
          <p className="subtitle">Indicadores clave de rendimiento y estadísticas</p>
        </header>

        {/* FILTROS */}
        <section className="filters-section">
          <div className="filter-group">
            <label>Desde:</label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="form-control"
            />
          </div>

          <div className="filter-group">
            <label>Hasta:</label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="form-control"
            />
          </div>

          <div className="filter-group">
            <label>Categoría:</label>
            <select
              name="category"
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              className="form-control"
            >
              <option value="">-- Todas las Categorías --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <button onClick={fetchData} className="filter-button">
            Actualizar Datos
          </button>

          <button
            onClick={handleExportCsv}
            className="export-button"
            title="Exportar Top de Productos al rango seleccionado"
          >
            Exportar CSV
          </button>
        </section>

        {/* HU-01: TARJETAS KPIs FINANCIEROS */}
        <section className="kpi-grid">
          <div className="kpi-card kpi-border-primary">
            <h3 className="kpi-title">Ventas Netas</h3>
            <p className="kpi-value">Bs {kpiStats.ventas.toFixed(2)}</p>
          </div>

          <div className="kpi-card kpi-border-success">
            <h3 className="kpi-title">Pedidos</h3>
            <p className="kpi-value">{kpiStats.pedidos}</p>
          </div>

          <div className="kpi-card kpi-border-warning">
            <h3 className="kpi-title">Ticket Promedio</h3>
            <p className="kpi-value">Bs {kpiStats.ticketPromedio.toFixed(2)}</p>
          </div>

          <div className="kpi-card kpi-border-info">
            <h3 className="kpi-title">Ganancia Est.</h3>
            <p className="kpi-value">Bs {kpiStats.ganancia.toFixed(2)}</p>
          </div>
        </section>

        {/* GRÁFICOS */}
        <section className="charts-section">
          <div className="chart-container">
            <Bar options={chartOptions} data={salesChartData} />
          </div>

          <FilteredProductsChart
            title={`Top 10 Productos en: ${categoryName}`}
            products={topProductsFiltered}
          />
        </section>

        {/* TABLA TOP PRODUCTOS GENERAL */}
        <section className="data-table-section">
          <h3>Detalle de Top Productos (General)</h3>
          <table className="products-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Vendidos</th>
                <th>Total Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {topProductsGeneral.length > 0 ? (
                topProductsGeneral.map((product, index) => (
                  <tr key={index}>
                    <td>{product.sku}</td>
                    <td>{product.nombre}</td>
                    <td>{product.cantidadVendida}</td>
                    <td>Bs {product.importeTotal}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    No hay datos de Top Productos (General) para mostrar en este rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* HU-002: ALERTAS DE STOCK CRÍTICO */}
        <section className="low-stock-section">
          <h3>Alertas de Stock Crítico</h3>

          {/* Filtros de HU-002 */}
          <div className="low-stock-filter">
            <label>Filtrar por producto o SKU:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: lapicero, LIB-001..."
              value={lowStockSearch}
              onChange={e => setLowStockSearch(e.target.value)}
            />
            {selectedCategoryId && (
              <small className="low-stock-current-category">
                Categoría aplicada: <strong>{categoryName}</strong>
              </small>
            )}
          </div>

          <p>
            Mostrando productos con stock menor al umbral de{' '}
            <strong>{lowStockData.threshold} unidades</strong>.
          </p>

          <div className="low-stock-summary">
            <div className="kpi-card kpi-border-danger">
              <h4 className="kpi-subtitle">Total Unidades Críticas</h4>
              <p className="kpi-value-small">{lowStockData.totalUnidades}</p>
            </div>

            <div className="kpi-card kpi-border-purple">
              <h4 className="kpi-subtitle">Valor Inventario Crítico</h4>
              <p className="kpi-value-small">
                Bs {lowStockData.totalValor.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th className="text-right">Stock Actual</th>
                  <th className="text-right">Stock Mínimo</th>
                  <th className="text-right">Valor Inventario (Bs)</th>
                </tr>
              </thead>
              <tbody>
                {filteredLowStockProducts.length > 0 ? (
                  filteredLowStockProducts.map((p, index) => (
                    <tr
                      key={index}
                      className={p.stockActual === 0 ? 'low-stock-empty' : ''}
                    >
                      <td>{p.sku}</td>
                      <td>{p.nombre}</td>
                      <td className="text-right">{p.stockActual}</td>
                      <td className="text-right">
                        {p.stockMinimo !== null ? p.stockMinimo : '-'}
                      </td>
                      <td className="text-right">
                        Bs {p.valorInventario.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      No hay productos en estado crítico de stock (o no coinciden con el
                      filtro).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminReports;
