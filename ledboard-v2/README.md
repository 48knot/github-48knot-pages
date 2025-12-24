# LED 전광판 (Mobile LED Display) - v2.0

모바일 기반 LED 스타일 텍스트 애니메이션 웹앱입니다.
**v2.0부터는 ES6 모듈 기반의 테스트 가능한 아키텍처로 재설계되었습니다.**

## 🎯 주요 특징

- 📱 **완전 반응형** - 모든 모바일 기기에서 최적화
- ✨ **다양한 애니메이션** - 스크롤, 깜빡임, 펄스
- 💾 **프리셋 저장** - LocalStorage를 통한 설정 저장
- 🔗 **URL 공유** - 설정을 URL로 인코딩하여 공유
- 🧪 **100% 테스트 가능** - 단위 + 통합 + E2E 테스트
- 📦 **모듈화** - 기능별 독립 모듈로 구성

## 📁 프로젝트 구조

```
ledboard-v2/
├── index.html                      # 순수 HTML (마크업만)
├── package.json                    # 프로젝트 설정 & 스크립트
├── vite.config.js                  # Vite 빌드 설정
├── vitest.config.js                # Vitest 테스트 설정
├── playwright.config.js            # Playwright E2E 설정
├── MIGRATION.md                    # 마이그레이션 계획 (상세)
│
├── assets/
│   ├── css/
│   │   └── main.css               # 모든 스타일 (인라인 제거됨)
│   └── js/
│       ├── main.js                # 애플리케이션 진입점
│       ├── modules/               # 기능별 모듈
│       │   ├── storage.js         # 프리셋 관리
│       │   ├── encoder.js         # URL 인코딩/디코딩
│       │   ├── validator.js       # 입력 검증
│       │   ├── display.js         # 디스플레이 제어
│       │   ├── animation.js       # 애니메이션 제어
│       │   ├── ui.js              # UI 상호작용
│       │   └── README.md
│       └── __tests__/             # 단위 테스트
│           ├── storage.test.js
│           ├── encoder.test.js
│           ├── validator.test.js
│           ├── display.test.js
│           ├── animation.test.js
│           ├── ui.test.js
│           └── README.md
│
├── e2e/                           # E2E 테스트
│   ├── preset.spec.js
│   ├── animation.spec.js
│   ├── sharing.spec.js
│   ├── mobile.spec.js
│   └── README.md
│
├── dist/                          # 프로덕션 빌드 (자동 생성)
├── playwright-report/             # Playwright 리포트 (자동 생성)
├── coverage/                      # 테스트 커버리지 리포트 (자동 생성)
│
└── .github/
    └── workflows/
        └── test.yml               # GitHub Actions CI/CD
```

## 🚀 빠른 시작

### 설치
```bash
cd ledboard-v2
npm install
```

### 개발 서버 실행
```bash
npm run dev
# http://localhost:3000 에서 열림
```

### 프로덕션 빌드
```bash
npm run build
npm run preview
```

## 🧪 테스트

### 단위 테스트 (Vitest)
```bash
# 모든 테스트 실행
npm test

# 파일 변경 시 자동 재실행
npm test -- --watch

# UI 대시보드
npm test -- --ui

# 커버리지 리포트
npm test -- --coverage
```

### E2E 테스트 (Playwright)
```bash
# 모든 E2E 테스트
npm run test:e2e

# 브라우저 보이기
npm run test:e2e:headed

# 디버깅 모드
npm run test:e2e:debug

# 테스트 리포트
npx playwright show-report
```

### 통합 테스트
```bash
# 단위 + E2E 모두 실행
npm run test:all
```

## 📊 테스트 현황

| 항목 | 상태 | 목표 |
|------|------|------|
| 단위 테스트 | ⏳ 진행 중 | 80%+ 커버리지 |
| E2E 테스트 | ⏳ 진행 중 | 모든 주요 워크플로우 |
| 번들 크기 | ⏳ 진행 중 | < 50KB |
| CI/CD | ✅ 설정 완료 | 매 푸시 시 자동 테스트 |

## 🏗️ 아키텍처

### 모듈 의존성 그래프
```
main.js (진입점)
  ├── storage.js (독립적)
  ├── encoder.js (독립적)
  ├── validator.js (독립적)
  ├── display.js (→ validator)
  ├── animation.js (→ validator)
  └── ui.js (→ display, animation, storage, encoder, validator)
```

### 데이터 흐름
```
사용자 입력 (UI)
    ↓
validator.js (검증)
    ↓
display.js (DOM 반영)
storage.js (저장)
encoder.js (공유용 인코딩)
    ↓
LED 디스플레이 업데이트
```

## 📝 개발 워크플로우

1. **기능 개발**
   ```bash
   git checkout -b feature/새기능
   ```

2. **단위 테스트 작성** (TDD)
   ```bash
   npm test -- --watch modules/새모듈.test.js
   ```

3. **모듈 구현**
   ```
   assets/js/modules/새모듈.js 작성
   ```

4. **브라우저 확인**
   ```bash
   npm run dev
   ```

5. **E2E 테스트 추가** (필요시)
   ```bash
   npx playwright test e2e/새기능.spec.js
   ```

6. **커밋 & 푸시**
   ```bash
   git add .
   git commit -m "feat: 새로운 애니메이션 추가"
   git push origin feature/새기능
   ```

7. **GitHub Actions 자동 테스트**
   - PR에서 모든 테스트 자동 실행
   - 모두 통과 시에만 병합 가능

## 🔄 마이그레이션 계획

v1.0 (인라인 단일 파일) → v2.0 (모듈화 + 테스트)

자세한 내용은 [MIGRATION.md](MIGRATION.md) 참고

### Phase별 진행 상황
- [x] Step 1: 기초 구조 설정 ✅
  - [x] package.json
  - [x] vitest.config.js
  - [x] playwright.config.js
  - [x] HTML 정리
  - [x] CSS 분리

- [ ] Step 2: 모듈 추출 & 테스트 (👈 현재 진행 중)
  - [ ] storage.js + 테스트
  - [ ] encoder.js + 테스트
  - [ ] validator.js + 테스트
  - [ ] display.js + 테스트
  - [ ] animation.js + 테스트
  - [ ] ui.js + 테스트
  - [ ] main.js 완성

- [ ] Step 3: E2E 테스트 추가
- [ ] Step 4: CI/CD 설정 (GitHub Actions)
- [ ] Step 5: 기존 프로젝트 대체

## 📚 주요 API

### Storage (프리셋 관리)
```javascript
import { loadPresets, savePresets, addPreset } from './modules/storage.js';

const presets = loadPresets();
addPreset('My Preset', { text: 'Hello', fontSize: 48, ... });
```

### Encoder (URL 공유)
```javascript
import { encodeConfig, decodeConfig } from './modules/encoder.js';

const encoded = encodeConfig({ text: 'Hello', ... });
const url = `?config=${encoded}`;
const decoded = decodeConfig(encoded);
```

### Validator (입력 검증)
```javascript
import { validateConfig } from './modules/validator.js';

const config = validateConfig({
  text: 'Hello',
  fontSize: '48',
  color: '#00FF00'
});
```

### Display (디스플레이 제어)
```javascript
import { DisplayManager } from './modules/display.js';

const display = new DisplayManager(
  document.getElementById('ledDisplay'),
  document.getElementById('marqueeTrack'),
  document.getElementById('staticText')
);

display.setConfig({ text: 'Hello', fontSize: 48, ... });
```

### Animation (애니메이션 제어)
```javascript
import { AnimationManager } from './modules/animation.js';

const animation = new AnimationManager(
  document.getElementById('marqueeTrack'),
  document.getElementById('staticText'),
  document.getElementById('previewSection')
);

animation.setMode('scroll');
animation.setScrollSpeed(120);
animation.recalculate();
```

## 🤝 기여 가이드

1. 새로운 기능은 **반드시 테스트**와 함께
2. **커버리지 80% 이상** 유지
3. **커밋 메시지** 명확하게:
   - `feat:` 새 기능
   - `fix:` 버그 수정
   - `refactor:` 코드 개선
   - `test:` 테스트 추가
   - `docs:` 문서 수정

## 🔧 문제 해결

### "npm test가 실패함"
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 제거
npm test -- --clearCache
```

### "Playwright 설치 실패"
```bash
npx playwright install
npx playwright install-deps
```

### "포트 3000이 이미 사용 중"
```bash
# 다른 포트 사용
npm run dev -- --port 3001
```

## 📖 문서

- [MIGRATION.md](MIGRATION.md) - 마이그레이션 상세 계획
- [assets/js/modules/README.md](assets/js/modules/README.md) - 모듈 설명
- [assets/js/__tests__/README.md](assets/js/__tests__/README.md) - 테스트 가이드
- [e2e/README.md](e2e/README.md) - E2E 테스트 가이드

## 📜 라이선스

MIT

## 👥 팀

**48knot Team**

---

마지막 업데이트: 2025-12-24
