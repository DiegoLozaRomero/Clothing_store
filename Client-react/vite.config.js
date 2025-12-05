// vite.config.js (Corregido)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Asumiendo que usas React

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Aquí está el cambio que hicimos antes (para solucionar el CSS)
    cssMinify: 'esbuild',
    outDir: 'dist', 
  },
  // ... cualquier otra configuración
});
