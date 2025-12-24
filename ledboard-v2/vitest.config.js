import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // jsdom: 브라우저 API 시뮬레이션 (localStorage 완벽 지원)
    environment: 'jsdom',

    // 테스트 격리를 위해 각 파일마다 새로운 환경 생성
    isolate: true,

    // 전역 변수로 테스트 함수 사용 가능 (import 불필요)
    globals: true,

    // 테스트 파일 패턴
    include: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '__tests__/',
        'e2e/',
        'dist/',
        '*.config.js'
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },

    // 타임아웃 설정
    testTimeout: 10000,

    // 테스트 호출 스택 출력
    logHeapUsage: true,

    // Setup 파일 (localStorage 등 환경 설정)
    setupFiles: ['./vitest.setup.js']
  },

  // Vite 설정
  server: {
    middlewareMode: true,
    hmr: false
  }
});
