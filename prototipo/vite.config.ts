import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works both on a web server and as a published artifact.
// The artifact is a single HTML file, so in that mode lazy pages (the team panel) are bundled in.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react()],
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
    ...(mode === 'artifact' ? { rolldownOptions: { output: { codeSplitting: false } } } : null),
  },
}));
