import React, { useState, useEffect, useCallback } from 'react';

// Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD
const getToday = () => new Date().toISOString().split('T')[0];
// Función auxiliar para obtener la fecha de hace 30 días
const get30DaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
};

const AdminReports = () => {
  // Estados para el rango de fechas
  const [fechaInicio, setFechaInicio] = useState(get30DaysAgo());
  const [fechaFin, setFechaFin] = useState(getToday());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para los datos de los reportes
  const [summary, setSummary] = useState({ 
    ventasTotales: '0.00', 
    pedidosRecibidos: 0, 
    nuevosClientes: 0 
  });
  const [topProducts, setTopProducts] = useState([]);

  // Función para obtener todos los reportes
  const fetchReports = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return;

    setLoading(true);
    setError(null);
    const queryString = `fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }; // Asume token de admin

    try {
      // 1. Obtener Resumen de Ventas
      const summaryRes = await fetch(`/api/admin/reportes/ventas-por-dia?${queryString}`, { headers });
      if (!summaryRes.ok) throw new Error('Fallo al cargar resumen de ventas.');
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      // 2. Obtener Top 10 Productos
      const topProductsRes = await fetch(`/api/admin/reportes/top-productos?${queryString}`, { headers });
      if (!topProductsRes.ok) throw new Error('Fallo al cargar top productos.');
      const topProductsData = await topProductsRes.json();
      setTopProducts(topProductsData);

    } catch (err) {
      setError(err.message);
      setSummary({ ventasTotales: '0.00', pedidosRecibidos: 0, nuevosClientes: 0 });
      setTopProducts([]);
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]); // Se llama al montar y al cambiar las fechas

  // Función de Exportar CSV (Implementación simple en Frontend)
  const exportToCSV = () => {
    if (topProducts.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    const header = ["SKU", "Producto", "Cantidad Vendida", "Importe Total"];
    const rows = topProducts.map(p => [p.sku, p.nombre, p.cantidadVendida, p.importeTotal].join(','));
    const csvContent = [header.join(','), ...rows].join('\n');
    
    // Crear enlace de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_top_productos_${fechaInicio}_a_${fechaFin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Función para manejar la aplicación del filtro (se puede usar con un botón)
  const handleApplyFilter = () => {
    fetchReports(); // Ya se encarga useEffect/useCallback
  };

  return (
    <div className="admin-reports-container">
      <h1>Reportes de Ventas [cite: 33]</h1>

      {/* FILTROS DE FECHA */}
      <div className="date-filters-panel">
        <label>
          Fecha de Inicio: [cite: 34]
          <input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </label>
        <label>
          Fecha de Fin: [cite: 37]
          <input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </label>
        <button onClick={handleApplyFilter} disabled={loading}>
            Aplicar Filtro [cite: 45]
        </button>
      </div>
      
      {loading && <p>Cargando reportes...</p>}
      {error && <p style={{ color: 'red' }}>Error al cargar: {error}</p>}
      
      {/* INDICADORES CLAVE */}
      <div className="key-metrics-panel">
        <div className="metric-card">
          <p>Ventas Totales [cite: 35]</p>
          <p className="metric-value">{summary.ventasTotales} Bs [cite: 36]</p>
        </div>
        <div className="metric-card">
          <p>Pedidos Recibidos [cite: 38]</p>
          <p className="metric-value">{summary.pedidosRecibidos} [cite: 39]</p>
        </div>
        <div className="metric-card">
          <p>Nuevos Clientes [cite: 40]</p>
          <p className="metric-value">{summary.nuevosClientes} [cite: 40]</p>
        </div>
      </div>
      
      {/* TABLA DE PRODUCTOS MÁS VENDIDOS */}
      <div className="top-products-section">
        <h2>Productos más vendidos [cite: 41]</h2>
        {/* Aquí iría un Gráfico [cite: 42, 46] si usas una librería como Chart.js */}
        
        <table className="products-report-table">
          <thead>
            <tr>
              <th>Producto [cite: 44]</th>
              <th>SKU [cite: 43]</th>
              <th>Cantidad vendida [cite: 43]</th>
              <th>Importe Total (Bs.)</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={index}>
                <td>{product.nombre}</td>
                <td>{product.sku}</td>
                <td>{product.cantidadVendida}</td>
                <td>{product.importeTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button 
            onClick={exportToCSV} 
            disabled={topProducts.length === 0}
            className="btn-export"
        >
            Exportar CSV [cite: 47]
        </button>
      </div>

    </div>
  );
};

export default AdminReports;