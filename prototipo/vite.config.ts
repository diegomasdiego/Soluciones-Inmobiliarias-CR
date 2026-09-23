import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works both on a web server and as a published artifact.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
  },
});
