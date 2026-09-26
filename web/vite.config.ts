import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The browser only ever talks to this dev server: /api is proxied to the API
// service (which the platform runs next to us). Published, the platform routes
// /api on the live site to the backend the same way — same origin both times.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: false,
      },
    },
  },
});
