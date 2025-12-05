import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Ignore from 'vite-plugin-ignore';

export default defineConfig({
  plugins: [
    react(),
    Ignore({
      patterns: ['css'] // Ignora errores de CSS
    })
  ]
});
