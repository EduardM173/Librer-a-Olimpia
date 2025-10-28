// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Asegúrate de reemplazar 5000 con el puerto real de tu servidor Express/Backend
const backendPort = 3000; 

export default defineConfig({
  plugins: [react()],
  server: {
    // Esto configura el proxy
    proxy: {
      // Redirige todas las solicitudes que empiezan por /api
      '/api': {
        target: `http://localhost:${backendPort}`, // La dirección de tu backend
        changeOrigin: true, // Necesario para que el host sea el backend
        // rewrite: (path) => path.replace(/^\/api/, ''), // Si tu backend NO espera el prefijo /api
      },
    },
  },
});
