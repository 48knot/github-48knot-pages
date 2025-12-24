import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',

  // 병렬 실행 워커 수
  fullyParallel: true,

  // 테스트 실패 시 재시도
  retries: process.env.CI ? 2 : 0,

  // CI 환경에서는 병렬 처리 비활성화
  workers: process.env.CI ? 1 : undefined,

  // 리포터 설정
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  // 공유 설정
  use: {
    // 각 테스트 액션의 스크린샷 저장 (기본: 실패 시만)
    screenshot: 'only-on-failure',

    // 실패한 테스트 비디오 저장
    video: 'retain-on-failure',

    // 타임아웃 설정 (ms)
    actionTimeout: 10000,
    navigationTimeout: 30000
  },

  // 웹 서버 설정 (테스트 시작 전 자동으로 실행)
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },

  // 브라우저별 테스트
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },

    // 모바일 테스트
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ]
});
