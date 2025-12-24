# 단위 테스트 (Unit Tests)

Vitest를 사용한 모듈별 단위 테스트 파일들입니다.

## 테스트 파일 목록

### storage.test.js
- 프리셋 저장/로드/삭제
- localStorage 동작
- JSON 직렬화/역직렬화
- 에러 처리

### encoder.test.js
- Base64 인코딩/디코딩
- URL 쿼리 파라미터 변환
- 손상된 데이터 처리
- 호환성 검증

### validator.test.js
- 텍스트 검증
- 숫자 범위 확인
- 색상 형식 확인
- 엣지 케이스

### display.test.js
- DOM 조작
- 상태 동기화
- CSS 스타일 적용
- 폰트 변경

### animation.test.js
- 애니메이션 모드 전환
- 스크롤 속도 계산
- 화면 리사이즈 시 재계산
- 애니메이션 재시작

### ui.test.js
- 이벤트 리스너 바인딩
- 입력 필드 변경 처리
- 모달 열기/닫기
- 탭 전환

## 실행 방법

```bash
# 모든 테스트 실행
npm test

# 파일 변경 시 자동 재실행
npm test -- --watch

# 특정 파일만 테스트
npm test -- storage.test.js

# UI 대시보드로 확인
npm test -- --ui

# 커버리지 리포트
npm test -- --coverage
```

## 테스트 작성 가이드

### 1단계: 테스트 구조
```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('모듈명', () => {
  beforeEach(() => {
    // 각 테스트 전에 초기화
  });

  it('기능 설명', () => {
    // Arrange: 테스트 데이터 준비
    const input = { /* ... */ };

    // Act: 함수 실행
    const result = myFunction(input);

    // Assert: 결과 검증
    expect(result).toEqual(expectedValue);
  });
});
```

### 2단계: 자주 사용하는 assertion
```javascript
expect(value).toBe(expectedValue);           // 정확한 값
expect(value).toEqual(expectedValue);        // 깊은 비교
expect(value).toContain(item);               // 포함 여부
expect(fn).toThrow();                        // 에러 발생
expect(value).toBeNull();                    // null 확인
expect(value).toBeDefined();                 // 정의 여부
```

### 3단계: DOM 테스트
```javascript
it('DOM 업데이트 테스트', () => {
  // jsdom을 사용하여 DOM 조작 테스트
  const el = document.createElement('div');
  el.textContent = 'Hello';

  expect(el.textContent).toBe('Hello');
});
```

## 커버리지 목표

| 모듈 | 목표 | 우선순위 |
|------|------|---------|
| storage.js | 100% | 🔴 필수 |
| encoder.js | 100% | 🔴 필수 |
| validator.js | 95% | 🟠 중요 |
| display.js | 80% | 🟡 권장 |
| animation.js | 80% | 🟡 권장 |
| ui.js | 70% | 🟡 권장 |

## 디버깅 팁

```bash
# 특정 테스트만 실행
npm test -- --grep "프리셋 저장"

# 상세 로그 출력
npm test -- --reporter=verbose

# 디버거 실행
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

## 더 알아보기

- [Vitest 문서](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Jest Matcher Reference](https://jestjs.io/docs/expect)
