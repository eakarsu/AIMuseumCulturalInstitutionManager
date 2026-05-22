import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3801,
    proxy: {
      '/api': {
        target: 'http://localhost:4014',
        changeOrigin: true,
      }
    }
  }
});
