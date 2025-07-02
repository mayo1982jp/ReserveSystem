import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ReserveSystem/', // GitHub Pages用のベースパス設定
  plugins: [react()],
  build: {
    outDir: 'docs', // ビルド出力先を 'docs' に変更
    emptyOutDir: true, // ビルド時にdocsフォルダをクリア
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
