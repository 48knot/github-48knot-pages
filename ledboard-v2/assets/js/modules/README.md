# JavaScript 모듈들

이 디렉토리에는 LED 전광판 애플리케이션의 기능별 모듈들이 포함됩니다.

## 모듈 목록

### 1. storage.js
**책임**: LocalStorage 기반 프리셋 관리
- `loadPresets()` - 프리셋 배열 로드
- `savePresets(list)` - 프리셋 배열 저장
- `addPreset(name, config)` - 새 프리셋 추가
- `deletePreset(index)` - 프리셋 삭제
- `updatePreset(index, name, config)` - 프리셋 업데이트

### 2. encoder.js
**책임**: 설정 ↔ URL 변환 (공유 기능)
- `encodeConfig(config)` - 설정을 Base64로 인코딩
- `decodeConfig(encoded)` - Base64 문자열을 설정으로 디코딩
- `getConfigFromURL()` - URL 쿼리에서 설정 추출

### 3. validator.js
**책임**: 입력 데이터 검증 및 정규화
- `validateText(text)` - 텍스트 검증
- `validateFontSize(size)` - 글자 크기 검증
- `validateColor(color)` - 색상 형식 검증
- `validateConfig(config)` - 전체 설정 검증

### 4. display.js
**책임**: LED 디스플레이 DOM 관리
- `DisplayManager` 클래스
  - `setConfig(config)` - 전체 설정 적용
  - `updateText(text)` - 텍스트 업데이트
  - `updateFontSize(size)` - 글자 크기 업데이트
  - `updateColor(color)` - 글자색 업데이트
  - `updateBackgroundColor(color)` - 배경색 업데이트
  - `updateFontFamily(family)` - 폰트 변경
  - `updateNeon(enabled)` - 네온 효과 토글
  - `render()` - 전체 리렌더링

### 5. animation.js
**책임**: 애니메이션 모드 제어
- `AnimationManager` 클래스
  - `setMode(mode)` - 애니메이션 모드 설정 (scroll, blink, pulse, none)
  - `setScrollSpeed(speed)` - 스크롤 속도 설정
  - `setStartOffset(offset)` - 시작 위치 설정
  - `setForcePortrait(enabled)` - 세로모드 강제 스크롤
  - `recalculate()` - 화면 변경 시 재계산
  - `restart()` - 애니메이션 강제 재시작

### 6. ui.js
**책임**: 사용자 상호작용 및 이벤트 처리
- `UIManager` 클래스
  - `openEditor()` - 에디터 시트 열기
  - `closeEditor()` - 에디터 시트 닫기
  - `switchTab(tabName)` - 탭 전환
  - `toggleFullscreen()` - 전체화면 토글
  - `share(config)` - 공유 기능
  - 이벤트 리스너 설정

## 모듈 간 의존성

```
main.js (진입점)
  ├── storage.js (독립적)
  ├── encoder.js (독립적)
  ├── validator.js (독립적)
  ├── display.js (depends: validator)
  ├── animation.js (depends: validator)
  └── ui.js (depends: display, animation, storage, encoder, validator)
```

## 테스트 파일

각 모듈에 해당하는 테스트 파일은 `__tests__/` 디렉토리에 위치합니다:
- `__tests__/storage.test.js`
- `__tests__/encoder.test.js`
- `__tests__/validator.test.js`
- `__tests__/display.test.js`
- `__tests__/animation.test.js`
- `__tests__/ui.test.js`

## 사용 예시

```javascript
// main.js에서의 사용
import { StorageManager } from './modules/storage.js';
import { DisplayManager } from './modules/display.js';
import { validateConfig } from './modules/validator.js';

// 모듈 초기화
const storage = new StorageManager();
const display = new DisplayManager(
  document.getElementById('ledDisplay'),
  document.getElementById('marqueeTrack'),
  document.getElementById('staticText')
);

// 설정 검증 및 적용
const config = validateConfig({
  text: 'Hello',
  fontSize: 48,
  // ...
});

display.setConfig(config);
storage.addPreset('My Preset', config);
```

## 추가 사항

- 모든 모듈은 ES6 문법 사용
- 각 모듈은 단일 책임 원칙(SRP) 준수
- 모듈 간 결합도 최소화
- 100% 테스트 커버리지 목표
