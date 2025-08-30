import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../../out/frontend'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'aiPanel.tsx')
    }
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './components')
    }
  }
});
