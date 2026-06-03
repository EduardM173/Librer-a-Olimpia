# Pruebas de Aceptación Java (Selenium + TestNG)

Este proyecto contiene la suite automatizada de pruebas de aceptación para el sistema "Librería Olimpia".

## 📋 Requisitos Previos (Para que las pruebas corran sin fallos)

Antes de ejecutar cualquier prueba, es **OBLIGATORIO** tener el sistema corriendo localmente:
1. **Base de Datos:** Asegúrate de que MySQL (o tu BD) esté activa y tenga datos de prueba.
2. **Backend (Node.js/Express):** Debe estar ejecutándose en `http://localhost:3000`. Verifica que el puerto en tu `.env` coincida.
3. **Frontend (React/Vite):** Debe estar ejecutándose en `http://localhost:5173`. Si Vite asigna otro puerto (ej. `5174`), los tests fallarán.

## 🚀 Cómo Ejecutar las Pruebas

Dado que ejecutar todas las pruebas a la vez puede saturar la memoria y "congelar" la máquina, se recomienda **correrlas de una en una**.

Para ejecutar una prueba específica, abre tu terminal en esta carpeta (`pruebas-aceptacion-java`) y usa:
```bash
mvn clean compile test -Dtest=NombreDelTest
```
*(Ejemplo: `mvn clean compile test -Dtest=RegistroExitosoTest`)*

---

## 👥 Asignación de Pruebas y Descripción (3 por persona)

A continuación, se detalla qué hace cada prueba y quién es el encargado de estudiarla/exponerla:

### 👤 1. Gabriel (Flujo de Registro)
*   **`RegistroExitosoTest`**: Simula a un usuario nuevo llenando el formulario de registro con datos correctos y verifica que se inicie sesión automáticamente.
*   **`RegistroEmailExistenteTest`**: Verifica que el sistema bloquee el registro y muestre un error si se intenta usar un correo que ya existe en la base de datos.
*   **`RegistroCamposVaciosTest`**: Valida las reglas del formulario, asegurando que no se pueda registrar un usuario si deja campos obligatorios en blanco.

### 👤 2. Eduardo (Flujo de Login)
*   **`LoginExitosoTest`**: Ingresa con credenciales válidas y verifica que el sistema otorgue el token y redirija al usuario mostrando su nombre en el navbar.
*   **`LoginContrasenaIncorrectaTest`**: Ingresa un correo válido pero una contraseña errónea para comprobar que aparece el mensaje de "Credenciales inválidas".
*   **`LoginUsuarioNoExistenteTest`**: Intenta iniciar sesión con un correo inventado para verificar que el sistema lo rechaza adecuadamente.

### 👤 3. Wilson (Catálogo Básico - ¡Las más fáciles! 😎)
*   **`CatalogoMuestraProductosTest`**: Solo entra a la página `/catalogo` y verifica que cargue la lista de productos. No hay que hacer clic en nada más.
*   **`BuscarProductoTest`**: Entra al catálogo, escribe "libro" en la barra de búsqueda y verifica que aparezcan resultados.
*   **`AgregarCarritoTest`**: Entra al catálogo, hace un solo clic en "Agregar al carrito" en cualquier producto y verifica que el número del carrito cambie a 1.

### 👤 4. Alex (Filtros y Checkout)
*   **`FiltrarCategoriaTest`**: Hace clic en los botones (tabs) de categorías del catálogo y verifica que la lista de productos se actualice.
*   **`ModificarCantidadTest`**: Abre el carrito de compras y utiliza los botones `+` o `-` para alterar la cantidad, verificando que el número cambie.
*   **`CheckoutCompletoTest`**: Realiza el flujo más largo: Inicia sesión, agrega un producto al carrito, y hace el flujo completo de "Finalizar Compra" hasta el checkout.

### 👤 5. Johan (Panel de Administración)
*   **`AdminCrearProductoTest`**: Inicia sesión como administrador (`admin@olimpia.com`), navega a `/admin/productos` y verifica que el botón para crear un nuevo producto esté habilitado.
*   **`AdminVerPedidosTest`**: Entra como administrador a `/admin/pedidos` y verifica que cargue la tabla/grilla maestra donde se ven todas las órdenes de los clientes.
*   **`AdminVerReportesTest`**: Entra a `/admin/reportes` como administrador y verifica que cargue el "Dashboard Gerencial (DSS)" junto con las gráficas de estadísticas.