import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Asegúrate que esta ruta sea correcta
import './AdminReports.css'; 

// 1. IMPORTACIONES DE GRÁFICOS
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

// 2. REGISTRO DE COMPONENTES DE CHART.JS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminReports = () => {
    const { token } = useAuth();

    // --- ESTADOS ---
    // 1. Fechas (Por defecto: Últimos 30 días)
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    // 2. Estado para los KPIs (HU-01: Dashboard)
    const [kpiStats, setKpiStats] = useState({
        ventas: 0,
        pedidos: 0,
        ticketPromedio: 0,
        ganancia: 0
    });

    // 3. Estado para la Tabla de Top Productos
    const [topProducts, setTopProducts] = useState([]);

    // 4. Estado para el Gráfico (HU-03 - Lo dejaremos preparado)
    const [salesChartData, setSalesChartData] = useState({
        labels: [],
        datasets: []
    });

    // --- EFECTO: CARGAR DATOS AL INICIO O AL CAMBIAR FECHAS ---
    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, dateRange]);

    const fetchData = async () => {
        try {
            const { start, end } = dateRange;
            const API_URL = 'http://localhost:4000/api'; // Ajusta si tu puerto es diferente

            // A) OBTENER KPIs FINANCIEROS (Backend modificado)
            const summaryRes = await fetch(`${API_URL}/admin/reportes/summary?fechaInicio=${start}&fechaFin=${end}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                // Actualizamos el estado con los datos reales
                setKpiStats({
                    ventas: Number(summaryData.ventas) || 0,
                    pedidos: Number(summaryData.pedidos) || 0,
                    ticketPromedio: Number(summaryData.ticketPromedio) || 0,
                    ganancia: Number(summaryData.ganancia) || 0
                });
            }

            // B) OBTENER TOP PRODUCTOS
            const topRes = await fetch(`${API_URL}/admin/reportes/top-productos?fechaInicio=${start}&fechaFin=${end}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (topRes.ok) {
                const topData = await topRes.json();
                setTopProducts(topData);

                // C) CONFIGURAR DATOS PARA EL GRÁFICO (Usando los top productos por ahora)
                setSalesChartData({
                    labels: topData.map(p => p.nombre.substring(0, 15) + '...'), // Nombres cortos
                    datasets: [
                        {
                            label: 'Cantidad Vendida',
                            data: topData.map(p => p.cantidadVendida),
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                        },
                    ],
                });
            }

        } catch (error) {
            console.error("Error cargando reportes:", error);
        }
    };

    const handleDateChange = (e) => {
        setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    };

    // Opciones básicas para el gráfico
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Productos Más Vendidos (Top 10)' },
        },
    };

    return (
        <div className="admin-reports-layout">
            {/* Sidebar (Simulada o importada) */}
            <aside className="admin-sidebar">
                <div className="logo-container">
                    <h2>Olimpia Admin</h2>
                </div>
                <nav>
                    {/* Aquí irían tus Links de navegación */}
                    <p style={{color: '#fff'}}>🏠 Dashboard</p>
                </nav>
            </aside>

            <main className="admin-main-content" style={{ padding: '20px', width: '100%' }}>
                <header style={{ marginBottom: '20px' }}>
                    <h1>Dashboard Gerencial (DSS)</h1>
                    <p className="subtitle">Indicadores clave de rendimiento y estadísticas</p>
                </header>

                {/* --- FILTROS DE FECHA --- */}
                <section className="filters-section" style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
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

                {/* --- SECCIÓN DE GRÁFICOS --- */}
                <section className="charts-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Bar options={chartOptions} data={salesChartData} />
                    </div>
                    {/* Espacio para un segundo gráfico (Pie Chart) en el futuro */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                        <p>Próximamente: Ventas por Categoría</p>
                    </div>
                </section>

                {/* --- TABLA DE DETALLE --- */}
                <section className="data-table-section" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3>Detalle de Top Productos</h3>
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
                            {topProducts.length > 0 ? (
                                topProducts.map((product, index) => (
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
                                        No hay datos para mostrar en este rango.
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