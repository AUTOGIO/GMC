import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages: site is at https://<user>.github.io/<repo>/
// Set BASE_PATH in CI to match repo name (e.g. /GMC/)
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  plugins: [react()],
  base,
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
