import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta a tu AuthContext
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

// 2. REGISTRO DE CHART.JS (Necesario para que el gráfico funcione)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Función auxiliar para obtener la fecha en formato YYYY-MM-DD
console.log("Ingresando...🥵🧠")
const formatDate = (date) => {
    console.log("Dentro de format Date🧠")
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    console.log("Terminando format date🧠")
    return [year, month, day].join('-');
};
console.log("Acabo de salir de format date🎺")
console.log("Ingresando a AdminReports...🗿🧠")

const AdminReports = () => {
    console.log("Estoy Dentro de AdminReports🗿🧠")
    const { user,token,logout } = useAuth(); // Agregamos logout
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    
    console.log("Este es el tokensito dentro de AdminReports: ", token)
    // 1. Estados de Fechas (Default: Últimos 7 días)
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const [startDate, setStartDate] = useState(formatDate(sevenDaysAgo));
    const [endDate, setEndDate] = useState(formatDate(today));
    
    // 2. Estados de Datos
    const [summaryData, setSummaryData] = useState({
        ventasTotales: '0,00 Bs',
        pedidosRecibidos: 0,
        nuevosClientes: 0,
    });

    const [topProducts, setTopProducts] = useState([]);


    // ===============================================
    // FETCHING DE DATOS (REFRACTORIZADO A FETCH)
    // ===============================================
    console.log("Definiendo fetchReports🤗❗")
    const fetchReports = async (start, end) => {
        console.log("Vamos a liberar al gorilita 🎉: ", token)
        if (!user || !token) return;
        console.log("Estoy acá... hola???🦍🔥🔥")
        setLoading(true);
        setError(null);
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
        
        // Construcción manual de los parámetros de consulta (query string)
        const query = `?fechaInicio=${start}&fechaFin=${end}`;
        const summaryUrl = `http://localhost:3000/api/admin/reportes/summary${query}`;
        const productsUrl = `http://localhost:3000/api/admin/reportes/top-productos${query}`;

        try {
            // Petición concurrente con fetch
            
            const [summaryResponse, productsResponse] = await Promise.all([
                fetch(summaryUrl, { method: 'GET', headers }),
                fetch(productsUrl, { method: 'GET', headers })
            ]);
            
            // Verificación de éxito de las peticiones
            if (!summaryResponse.ok) {
                // Leemos el JSON de la respuesta de error para obtener el mensaje
                const errorData = await summaryResponse.json();
                throw new Error(errorData.message || `Error ${summaryResponse.status}: al obtener el resumen.`);
            }
            if (!productsResponse.ok) {
                const errorData = await productsResponse.json();
                throw new Error(errorData.message || `Error ${productsResponse.status}: al obtener los productos.`);
            }

            // Parsear las respuestas a JSON
            const summaryDataJson = await summaryResponse.json();
            const productsDataJson = await productsResponse.json();


            // Formatear y setear Resumen
            setSummaryData({
                ventasTotales: `${Number(summaryDataJson.ventasTotales).toLocaleString('es-BO', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                })} Bs`,
                pedidosRecibidos: summaryDataJson.pedidosRecibidos,
                nuevosClientes: summaryDataJson.nuevosClientes,
            });

            // Setear Top Productos
            setTopProducts(productsDataJson);

        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err.message || 'Error desconocido al cargar los reportes.');
            // Opcional: limpiar datos si hay error
            setSummaryData({ ventasTotales: '0,00 Bs', pedidosRecibidos: 0, nuevosClientes: 0 });
            setTopProducts([]);
        } finally {
            setLoading(false);
        }
    };
    
    // 3. Efecto para cargar los datos al inicio y al cambiar las fechas
    useEffect(() => {
        fetchReports(startDate, endDate);
    }, [token, startDate, endDate]); // Dependencias: token, y las fechas

    // ===============================================
    // MANEJADORES DE EVENTOS
    // ===============================================

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    const handleFilter = (e) => {
        e.preventDefault();
        fetchReports(startDate, endDate);
    };

    const handleLogout = () => {
        // Lógica de cierre de sesión
        logout(); // Asumiendo que useAuth provee una función logout
    };

    console.log("Gracias por liberarme🦍🎉, ahora vamos por el CSV❗❗❗")
    const exportToCSV = async () => {
        if (!user || !token) return;

        setLoading(true);

        try {
            // Petición para descargar el CSV
            const csvUrl = `http://localhost:3000/api/admin/reportes/top-productos?fechaInicio=${startDate}&fechaFin=${endDate}&format=csv`;
            
            const response = await fetch(csvUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                 // Si la respuesta no es ok, intenta obtener el texto de error o el estado
                 const errorText = await response.text();
                 throw new Error(`Error ${response.status} al obtener el CSV: ${errorText.slice(0, 100)}...`);
            }

            // Crucial para fetch: obtener el cuerpo de la respuesta como un Blob
            const blobData = await response.blob();

            // Lógica para descargar el archivo
            const url = window.URL.createObjectURL(blobData);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `top_productos_${startDate}_a_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Limpiar la URL del blob

        } catch (err) {
            console.error('Error exporting CSV:', err);
            alert(`Error al exportar el archivo CSV: ${err.message || 'Error desconocido.'}`);
        } finally {
            setLoading(false);
        }
    };


    // ===============================================
    // CONFIGURACIÓN DEL GRÁFICO DE BARRAS
    // ===============================================

    const dataForChart = {
        // Obtenemos los nombres de los productos para el eje X
        labels: topProducts.map(p => p.nombre), 
        datasets: [
            {
                label: 'Cantidad Vendida',
                // Obtenemos las cantidades para la altura de las barras
                data: topProducts.map(p => p.cantidadVendida), 
                backgroundColor: 'rgba(75, 192, 192, 0.8)', // Color de las barras
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                display: false, // Ocultar la leyenda si solo hay un dataset
            },
            title: {
                display: true,
                text: 'Top Productos Vendidos por Cantidad',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                // Aseguramos que el eje Y solo muestre números enteros
                ticks: {
                    precision: 0
                },
                title: {
                    display: true,
                    text: 'Unidades Vendidas',
                },
            },
            x: {
                // Opcional: Rotar etiquetas si son muy largas
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                }
            }
        },
    };


    // ===============================================
    // RENDERIZADO
    // ===============================================

    const totalVentas = summaryData.ventasTotales;
    
    return (
        <div className="admin-reports-layout">
            
            {/* Sidebar (Sin cambios) */}
            <aside className="admin-sidebar">
                <div className="logo-container">
                    <h1 className="logo-text">Olimpia</h1>
                    <p className="logo-subtitle">LIBRERÍA Y PAPELERÍA</p>
                </div>
                <nav className="main-nav">
                    <ul className="nav-list">
                        <li><a href="/admin/productos" className="nav-item">Productos</a></li>
                        <li><a href="/admin/pedidos" className="nav-item">Pedidos</a></li>
                        <li><a href="/admin/reportes" className="nav-item active">Reportes</a></li>
                        <li><a href="/admin/clientes" className="nav-item">Clientes</a></li>
                    </ul>
                </nav>
            </aside>

            {/* Contenido Principal */}
            <main className="admin-reports-content">
                
                <header className="admin-header">
                    <div className="user-info">
                        <span>{user ? user.nombre : 'Admin'}</span>
                        <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
                    </div>
                </header>

                <h2 className="report-title">Reportes de Ventas</h2>

                {/* Mensajes de Estado */}
                {loading && <div className="loading-message">Cargando reportes...</div>}
                {error && <div className="error-message">{error}</div>}

                {/* ------------------- Filtros y Acciones ------------------- */}
                <form className="filter-actions-row" onSubmit={handleFilter}>
                    <div className="date-filters">
                        <div className="date-input-group">
                            <label htmlFor="fechaInicio">Fecha de Inicio</label>
                            <input 
                                type="date" 
                                id="fechaInicio" 
                                className="date-input" 
                                value={startDate}
                                onChange={handleStartDateChange}
                                required
                            />
                        </div>
                        <div className="date-input-group">
                            <label htmlFor="fechaFin">Fecha de Fin</label>
                            <input 
                                type="date" 
                                id="fechaFin" 
                                className="date-input" 
                                value={endDate}
                                onChange={handleEndDateChange}
                                required
                            />
                        </div>
                        
                        <button type="submit" className="filter-button" disabled={loading}>
                            Aplicar Filtro
                        </button>
                    </div>

                    <button 
                        type="button" 
                        className="export-button"
                        onClick={exportToCSV}
                        disabled={loading || topProducts.length === 0}
                    >
                        Exportar CSV
                    </button>
                </form>

                {/* ------------------- Tarjetas Resumen ------------------- */}
                <div className="summary-cards-grid">
                    
                    <div className="summary-card">
                        <p className="card-label">Ventas Totales</p>
                        <h3 className="card-value total-sales">{totalVentas}</h3>
                    </div>
                    
                    <div className="summary-card">
                        <p className="card-label">Pedidos Recibidos</p>
                        <h3 className="card-value">{summaryData.pedidosRecibidos}</h3>
                    </div>

                    <div className="summary-card">
                        <p className="card-label">Nuevos Clientes</p>
                        <h3 className="card-value">{summaryData.nuevosClientes}</h3>
                    </div>

                </div>

                {/* ------------------- Productos Más Vendidos ------------------- */}
                <section className="top-products-section">
                    <h3 className="section-title">Productos más vendidos</h3>
                    
                    {/* 3. GRÁFICO DE BARRAS INTEGRADO */}
                    <div className="chart-container">
                        {topProducts.length > 0 && !loading ? (
                            // Renderiza el gráfico solo si hay datos
                            <Bar data={dataForChart} options={chartOptions} />
                        ) : (
                            <div className="chart-placeholder-empty">
                                {loading ? "Cargando gráfico..." : "No hay datos de productos para graficar en este rango."}
                            </div>
                        )}
                    </div>

                    {/* Tabla/Lista de Productos */}
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Producto</th>
                                    <th>Cantidad Vendida</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.length > 0 ? (
                                    topProducts.map((product, index) => (
                                        <tr key={index}>
                                            <td>{product.sku}</td>
                                            <td>{product.nombre}</td>
                                            <td>{product.cantidadVendida}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{textAlign: 'center'}}>
                                            No hay productos vendidos en este rango de fechas.
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