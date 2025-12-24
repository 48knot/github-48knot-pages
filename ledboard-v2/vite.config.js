import { defineConfig } from 'vite';

export default defineConfig({
  // 개발 서버 설정
  server: {
    port: 3000,
    open: false,
    strictPort: false
  },

  // 빌드 설정
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',

    // 롤업 최적화
    rollupOptions: {
      output: {
        // CSS 분리
        assetFileNames: 'assets/[name].[hash][extname]',
        // JS 분리
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js'
      }
    },

    // 번들 분석
    reportCompressedSize: true,
    sourcemap: false
  },

  // 미리보기 서버 (프로덕션 빌드 검증용)
  preview: {
    port: 4173,
    open: false
  }
});
