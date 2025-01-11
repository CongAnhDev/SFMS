import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ include: /\.(tsx|ts)$/, exclude: /node_modules/ })],
  resolve: {
    alias: {
      '@tailus-ui': path.resolve(__dirname, 'src/components/tailus-ui'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
    },
  },
});
