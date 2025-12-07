// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // 👈 ¡Cámbialo a relativo!
  plugins: [react()],
  build: {
    cssMinify: 'esbuild',
    outDir: 'dist',
  },
});