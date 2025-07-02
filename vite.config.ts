import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ReserveSystem/', // GitHub Pages用のベースパス設定
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
