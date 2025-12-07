// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',  // 🚨 NECESARIO para producción en Amplify
  plugins: [react()],
  build: {
    cssMinify: 'esbuild',
    outDir: 'dist',
  },
});
