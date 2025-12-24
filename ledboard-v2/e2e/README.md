# E2E 테스트 (End-to-End Tests)

Playwright를 사용한 통합 테스트 파일들입니다.
실제 브라우저에서 사용자 시나리오를 검증합니다.

## 테스트 파일 목록

### preset.spec.js
사용자가 프리셋을 저장, 로드, 삭제, 공유하는 전체 워크플로우 테스트

**테스트 케이스**:
- 프리셋 저장
- 저장된 프리셋 로드
- 프리셋 삭제
- 프리셋 공유

### animation.spec.js
애니메이션 모드 전환 및 스타일 적용 테스트

**테스트 케이스**:
- 스크롤 애니메이션
- 깜빡임 애니메이션
- 펄스 애니메이션
- 정적 표시 (없음)
- 화면 리사이즈 시 재계산

### sharing.spec.js
공유 URL 생성 및 복원 테스트

**테스트 케이스**:
- 설정을 URL로 인코딩
- URL로 접속 시 설정 복원
- 클립보드 복사
- 모바일 공유 API

### mobile.spec.js
모바일 반응형 테스트

**테스트 케이스**:
- 다양한 화면 크기
- 세로/가로 모드 전환
- 터치 상호작용
- Safe Area 처리

## 실행 방법

```bash
# 모든 E2E 테스트 실행
npm run test:e2e

# 브라우저 보이기
npm run test:e2e:headed

# 디버깅 모드
npm run test:e2e:debug

# 특정 파일만 실행
npx playwright test e2e/preset.spec.js

# 특정 브라우저만 실행
npx playwright test --project=chromium

# 리포트 확인
npx playwright show-report
```

## 테스트 작성 가이드

### 1단계: 기본 구조
```javascript
import { test, expect } from '@playwright/test';

test.describe('기능명', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전 초기화
    await page.goto('http://localhost:3000/ledboard/');
  });

  test('사용자 시나리오 설명', async ({ page }) => {
    // 1. 사용자 액션
    await page.fill('input[name="text"]', 'Hello');

    // 2. 상태 검증
    const display = page.locator('.display');
    await expect(display).toContainText('Hello');

    // 3. 추가 액션
    await page.click('button:has-text("Save")');

    // 4. 최종 검증
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### 2단계: 자주 사용하는 메서드

```javascript
// 네비게이션
await page.goto('url');
await page.goBack();

// 입력
await page.fill('selector', 'value');
await page.type('selector', 'text');
await page.click('selector');

// 검증
await expect(page.locator('selector')).toBeVisible();
await expect(page.locator('selector')).toContainText('text');
await expect(page.locator('selector')).toHaveValue('value');

// 대기
await page.waitForNavigation();
await page.waitForSelector('selector');
await page.waitForTimeout(1000);

// 스크린샷 & 비디오
await page.screenshot({ path: 'screenshot.png' });
```

### 3단계: 고급 패턴

```javascript
// 여러 페이지 상호작용
test('새 탭에서 공유 링크 열기', async ({ browser, page }) => {
  await page.goto('http://localhost:3000/ledboard/');

  // 공유 URL 추출
  const shareUrl = await page.inputValue('input[value*="http"]');

  // 새 탭에서 열기
  const newPage = await browser.newPage();
  await newPage.goto(shareUrl);

  // 설정이 복원됨
  await expect(newPage.locator('.display')).toContainText('같은 텍스트');
});

// 이미지 비교
await expect(page.locator('.display')).toHaveScreenshot();

// API 요청 인터셉트
await page.route('**/api/**', route => {
  route.continue();
});
```

## 모바일 테스트 설정

```javascript
test.describe('모바일 반응형', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 12
  });

  test('모바일에서 동작', async ({ page }) => {
    // 모바일 해상도에서 테스트
  });
});
```

## CI/CD 통합

GitHub Actions에서 자동으로 실행됩니다:

```yaml
- run: npm run build
- run: npx playwright install
- run: npx playwright test
- uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## 성능 최적화

```javascript
// 병렬 실행 (기본값)
test.describe.parallel('병렬 테스트 그룹', () => {
  // 이 그룹의 테스트들은 병렬로 실행됨
});

// 순차 실행
test.describe.serial('순차 테스트 그룹', () => {
  // 이 그룹의 테스트들은 순차로 실행됨
});
```

## 문제 해결

```bash
# 타임아웃 증가
npx playwright test --timeout=60000

# 상세 로그
PWDEBUG=1 npx playwright test

# 느린 모션
npx playwright test --headed --slow-mo=1000
```

## 더 알아보기

- [Playwright 문서](https://playwright.dev)
- [Locator 가이드](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices)
