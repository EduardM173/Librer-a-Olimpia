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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = 'http://localhost:3000/api/admin/reportes'; // URL base para reportes

// --- NUEVO COMPONENTE: Gráfico de Productos Filtrados por Categoría ---
const FilteredProductsChart = ({ title, products }) => {
    // 1. Preparar datos para Chart.js
    const data = {
        labels: products.map(p => p.nombre.substring(0, 20) + (p.nombre.length > 20 ? '...' : '')),
        datasets: [
            {
                label: 'Cantidad Vendida (Unidades)',
                data: products.map(p => p.cantidadVendida),
                backgroundColor: 'rgba(255, 99, 132, 0.6)', // Color Rosa/Rojo (Mantenido)
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    // 2. Opciones del Gráfico
    const options = {
        responsive: true,
        maintainAspectRatio: false, // Permitir que el contenedor controle el tamaño
        // indexAxis: 'y', // <<-- ELIMINADO para usar el valor predeterminado 'x' (gráfico vertical)
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: title },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        // Mostrar la cantidad y el total vendido en el tooltip
                        const totalImporte = products[context.dataIndex].importeTotal;
                        label += `${context.raw} unidades (Bs ${totalImporte})`;
                        return label;
                    }
                }
            }
        },
        scales: {
            y: { // <<-- CAMBIADO de 'x' a 'y' para que el eje de valores sea el vertical
                title: { display: true, text: 'Unidades Vendidas' },
                beginAtZero: true
            }
        }
    };

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ height: '350px' }}> {/* Contenedor con altura fija para el gráfico */}
                {products.length > 0 ? (
                    <Bar options={options} data={data} />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                        <p>Seleccione una categoría o no hay datos para el rango seleccionado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
// -----------------------------------------------------------------

const AdminReports = () => {
    const { token } = useAuth();

    // --- ESTADOS ORIGINALES ---
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [kpiStats, setKpiStats] = useState({ ventas: 0, pedidos: 0, ticketPromedio: 0, ganancia: 0 });
    const [topProductsGeneral, setTopProductsGeneral] = useState([]); 
    const [salesChartData, setSalesChartData] = useState({ labels: [], datasets: [] });

    // --- ESTADOS AÑADIDOS PARA CATEGORÍAS ---
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(''); 
    const [topProductsFiltered, setTopProductsFiltered] = useState([]);

    // --- EFECTO: CARGAR CATEGORÍAS (Solo se ejecuta una vez al inicio) ---
    useEffect(() => {
        const fetchCategories = async () => {
            if (!token) return;

            try {
                // NOTA: La ruta ya fue corregida en el backend según la conversación anterior
                const categoryRes = await fetch('http://localhost:3000/api/categories', { 
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (categoryRes.ok) {
                    const categoryData = await categoryRes.json();
                    setCategories(categoryData);
                }
            } catch (error) {
                console.error("Error cargando categorías:", error);
            }
        };

        fetchCategories();
    }, [token]);


    // --- EFECTO PRINCIPAL: CARGAR DATOS AL CAMBIAR FECHAS O CATEGORÍA ---
    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, dateRange, selectedCategoryId]);


    const fetchData = async () => {
        try {
            const { start, end } = dateRange;
            
            // A) OBTENER KPIs FINANCIEROS
            const summaryRes = await fetch(`${API_BASE_URL}/summary?fechaInicio=${start}&fechaFin=${end}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                setKpiStats({
                    ventas: Number(summaryData.ventas) || 0,
                    pedidos: Number(summaryData.pedidos) || 0,
                    ticketPromedio: Number(summaryData.ticketPromedio) || 0,
                    ganancia: Number(summaryData.ganancia) || 0
                });
            }

            // B) OBTENER TOP PRODUCTOS GENERAL
            const topGeneralRes = await fetch(`${API_BASE_URL}/top-productos?fechaInicio=${start}&fechaFin=${end}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (topGeneralRes.ok) {
                const topGeneralData = await topGeneralRes.json();
                setTopProductsGeneral(topGeneralData);

                // Configurar datos para el GRÁFICO (Top 10 General)
                setSalesChartData({
                    labels: topGeneralData.map(p => p.nombre.substring(0, 15) + '...'),
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

            // C) OBTENER TOP PRODUCTOS FILTRADO
            if (selectedCategoryId) {
                const topFilteredRes = await fetch(`${API_BASE_URL}/top-productos?fechaInicio=${start}&fechaFin=${end}&categoriaId=${selectedCategoryId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (topFilteredRes.ok) {
                    const topFilteredData = await topFilteredRes.json();
                    setTopProductsFiltered(topFilteredData);
                } else {
                    setTopProductsFiltered([]);
                }
            } else {
                // Si no hay categoría seleccionada, la lista filtrada está vacía
                setTopProductsFiltered([]);
            }

        } catch (error) {
            console.error("Error cargando reportes:", error);
        }
    };

    const handleDateChange = (e) => {
        setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (e) => {
        setSelectedCategoryId(e.target.value);
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Top 10 Productos Más Vendidos (General)' },
        },
    };

    // Obtener el nombre de la categoría seleccionada para el título
    const categoryName = categories.find(c => String(c.id) === selectedCategoryId)?.nombre || 'General';


    return (
        <div className="admin-reports-layout">

            <main className="admin-main-content" style={{ padding: '20px', width: '100%' }}>
                <header style={{ marginBottom: '20px' }}>
                    <h1>Dashboard Gerencial (DSS) 📊</h1>
                    <p className="subtitle">Indicadores clave de rendimiento y estadísticas</p>
                </header>

                {/* --- FILTROS DE FECHA Y CATEGORÍA --- */}
                <section className="filters-section" style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    
                    {/* Filtro de Fecha - Desde */}
                    <div className="filter-group">
                        <label>Desde: </label>
                        <input 
                            type="date" 
                            name="start" 
                            value={dateRange.start} 
                            onChange={handleDateChange}
                            className="form-control"
                        />
                    </div>
                    
                    {/* Filtro de Fecha - Hasta */}
                    <div className="filter-group">
                        <label>Hasta: </label>
                        <input 
                            type="date" 
                            name="end" 
                            value={dateRange.end} 
                            onChange={handleDateChange}
                            className="form-control"
                        />
                    </div>

                    {/* Filtro de Categoría (NUEVO) */}
                    <div className="filter-group">
                        <label>Categoría: </label>
                        <select
                            name="category"
                            value={selectedCategoryId}
                            onChange={handleCategoryChange}
                            className="form-control"
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">-- Todas las Categorías --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={fetchData} 
                        style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Actualizar Datos
                    </button>
                </section>

                {/* --- HU-01: TARJETAS DE KPIs--- */}
                <section className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    
                    {/* Tarjeta 1: Ventas */}
                    <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '5px solid #007bff' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Ventas Netas</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#333' }}>
                            Bs {kpiStats.ventas.toFixed(2)}
                        </p>
                    </div>

                    {/* Tarjeta 2: Pedidos */}
                    <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '5px solid #28a745' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Pedidos</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#333' }}>
                            {kpiStats.pedidos}
                        </p>
                    </div>

                    {/* Tarjeta 3: Ticket Promedio */}
                    <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '5px solid #ffc107' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Ticket Promedio</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#333' }}>
                            Bs {kpiStats.ticketPromedio.toFixed(2)}
                        </p>
                    </div>

                    {/* Tarjeta 4: Ganancia (Simulada/Calculada) */}
                    <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '5px solid #17a2b8' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Ganancia Est.</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#333' }}>
                            Bs {kpiStats.ganancia.toFixed(2)}
                        </p>
                    </div>
                </section>

                {/* --- SECCIÓN DE GRÁFICOS Y TABLA FILTRADA --- */}
                <section className="charts-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    
                    {/* Gráfico de Barras - Top 10 General */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Bar options={chartOptions} data={salesChartData} />
                    </div>

                    {/* Gráfico de Productos Filtrados por Categoría (Ahora Vertical) */}
                    <FilteredProductsChart 
                        title={`Top 10 Productos en: ${categoryName}`}
                        products={topProductsFiltered}
                    />
                </section>

                {/* --- TABLA DE DETALLE (General) --- */}
                <section className="data-table-section" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3>Detalle de Top Productos (General)</h3>
                    <table className="products-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>SKU</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Producto</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Vendidos</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Total Ingresos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProductsGeneral.length > 0 ? (
                                topProductsGeneral.map((product, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>{product.sku}</td>
                                        <td style={{ padding: '12px' }}>{product.nombre}</td>
                                        <td style={{ padding: '12px' }}>{product.cantidadVendida}</td>
                                        <td style={{ padding: '12px' }}>Bs {product.importeTotal}</td>
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

            </main>
        </div>
    );
};

export default AdminReports;