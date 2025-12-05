import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import Ignore from 'vite-plugin-ignore'; // ❌ eliminar o comentar

export default defineConfig({
  plugins: [
    react(),
    // Ignore({ patterns: ['css'] }) // ❌ eliminar o comentar
  ]
});
