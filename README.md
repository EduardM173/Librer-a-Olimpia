
# 📚 SISTEMA DE GESTIÓN INTEGRAL – Librería Olimpia

**Repositorio del proyecto final del equipo para la materia de Sistemas de Soporte a las Decisiones Gerenciales.**

---

## 👥 Equipo SCRUM

| Rol                     | Nombre                                            | Responsabilidades                                   |
|-------------------------|---------------------------------------------------|-----------------------------------------------------|
| 🎯 Product Owner        | Medina Paredes Esmeralda Paula                    | Priorizar backlog, validar incrementos y cierre     |
| 🧭 Scrum Master         | Neil Erick Lipan Valdez                           | Facilitar Scrum, eliminar impedimentos y QA         |
| 👨‍💻 Líder Técnico / Dev  | Eduardo Apaza Condori                             | Arquitectura, lógica de negocio y revisión de código|
| 👨‍💻 Desarrollador        | Joaquin Anzaldo Gutierrez                         | Implementación de funcionalidades Frontend/Backend  |
| 👨‍💻 Desarrollador        | Alan Ariel Maldonado Carvajal                     | Implementación de funcionalidades Frontend/Backend  |

---

## 📌 Descripción del Proyecto

El sistema moderniza la **Librería y Papelería Olimpia S.R.L.**, integrando dos módulos estratégicos:

- **TPS (Transaccional):** Automatización de ventas, control de inventario y gestión de clientes.
- **DSS (Decisional):** Dashboard gerencial con 10 KPIs clave para la toma de decisiones.

### 📊 KPIs Implementados (DSS)
El sistema procesa datos en tiempo real para generar los siguientes indicadores:

1.  **Ventas Totales Netas:** Ingresos acumulados.
2.  **Ganancia Bruta Estimada:** Rentabilidad real.
3.  **Ticket Promedio:** Gasto medio por cliente.
4.  **Volumen de Pedidos:** Cantidad de transacciones.
5.  **Stock Crítico:** Alerta de productos ≤ 5 unidades.
6.  **Valor en Riesgo:** Capital inmovilizado en stock crítico.
7.  **Top Productos:** Ranking de los más vendidos.
8.  **Tendencia por Categoría:** Ventas por línea (Libros vs. Papelería).
9.  **Unidades Vendidas:** Rotación física de producto.
10. **Eficiencia de Stock:** Identificación de productos "Hueso".

---

## 📋 Normas del Equipo

- **📢 Comunicación:** Whatsapp, reuniones presenciales y virtuales.
- **🗓️ Metodología:** Scrum con dos Sprints (Operativo y Estratégico).
- **🛠️ Control de versiones:** - Uso de GitHub y ramas por funcionalidad (*feature-branches*).  
  - La rama `main` está protegida.  
  - Pull Requests obligatorias y revisión por pares.
- **✅ Definición de Hecho:** - Código probado, funcional y validado por el Product Owner.

---

## 🚀 Tecnologías Clave

### 🔹 Frontend
- **React + Vite:** Construcción de interfaces SPA responsivas.
- **Chart.js:** Visualización de métricas e indicadores gráficos.

### 🔹 Backend
- **Node.js + Express:** API RESTful y lógica del servidor.
- **JWT:** Autenticación y seguridad de usuarios.

### 🔹 Base de Datos
- **MySQL:** Almacenamiento relacional para integridad transaccional.

### 🔹 Herramientas
- **Jira:** Gestión de tareas y seguimiento del Backlog.
- **Postman:** Pruebas de integración de API.
- **Git + GitHub:** Control de versiones colaborativo.

---

## 🐞 MantisBT con Docker

Para gestionar incidencias del proyecto con MantisBT sin mezclarlo con la base de datos principal, el repositorio incluye una composición Docker separada.

### Levantar el servicio

```powershell
docker compose -f docker-compose.mantisbt.yml up -d --build
```

### Completar la instalación

```powershell
powershell -ExecutionPolicy Bypass -File .\docker\mantisbt\install.ps1
```

### Acceso

- MantisBT: http://localhost:8081/
- Instalador: http://localhost:8081/admin/install.php

### Credenciales de la base de datos Docker

- Host: `mantis-db`
- Base: `mantisbt`
- Usuario: `mantisbt`
- Contraseña: `mantisbt123`

### Notas

- La imagen usa MantisBT 2.28.3 preconstruido con Apache.
- La base de datos es independiente del MySQL del proyecto principal.
- Después de instalar, MantisBT recomienda restringir o eliminar el directorio `admin`.

---

## 📝 Licencia

Este proyecto es parte de un trabajo académico y no está destinado a uso comercial.
