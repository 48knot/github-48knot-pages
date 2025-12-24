/**
 * Display Module Tests
 *
 * DOM 조작 및 스타일 적용 기능 검증
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initializeDOMCache,
  resetDOMCache,
  setText,
  setFontSize,
  setLetterSpacing,
  setTextColor,
  setBackgroundColor,
  setNeon,
  setFontFamily,
  setAnimationMode,
  applyScroll,
  applyConfig,
  isTextOverflow,
  isFullscreenActive,
  isLandscapeOrientation,
  updateLandscapeHint,
  showLandscapeHint,
  requestFullscreen,
  showFullscreenEditButton
} from '../modules/display.js';

// Mock DOM 구조 생성
function createMockDOM() {
  const container = document.createElement('div');

  const previewSection = document.createElement('div');
  previewSection.id = 'previewSection';
  // requestFullscreen 메서드 추가
  previewSection.requestFullscreen = vi.fn().mockResolvedValue(undefined);

  const ledDisplay = document.createElement('div');
  ledDisplay.id = 'ledDisplay';

  const marqueeTrack = document.createElement('div');
  marqueeTrack.id = 'marqueeTrack';
  marqueeTrack.style.display = 'flex';

  const seg1 = document.createElement('span');
  seg1.id = 'seg1';
  seg1.textContent = '테스트';
  seg1.className = 'marquee-seg';

  const seg2 = document.createElement('span');
  seg2.id = 'seg2';
  seg2.className = 'marquee-seg';

  const staticText = document.createElement('div');
  staticText.id = 'staticText';
  staticText.className = 'static-text';

  const landscapeHint = document.createElement('div');
  landscapeHint.id = 'landscapeHint';

  const fsEditBtn = document.createElement('button');
  fsEditBtn.id = 'fsEditBtn';

  // DOM 트리 구성
  marqueeTrack.appendChild(seg1);
  marqueeTrack.appendChild(seg2);
  ledDisplay.appendChild(marqueeTrack);
  ledDisplay.appendChild(staticText);
  previewSection.appendChild(ledDisplay);
  container.appendChild(previewSection);
  container.appendChild(landscapeHint);
  container.appendChild(fsEditBtn);

  document.body.appendChild(container);

  // scrollWidth 모킹
  Object.defineProperty(seg1, 'scrollWidth', {
    value: 200,
    configurable: true
  });

  return { container, previewSection, ledDisplay, marqueeTrack, seg1, seg2, staticText, landscapeHint, fsEditBtn };
}

describe('Display Module', () => {
  let mockDOM;

  beforeEach(() => {
    resetDOMCache();
    mockDOM = createMockDOM();
    // window.matchMedia 모킹 (가로 모드)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(orientation: landscape)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    });
  });

  afterEach(() => {
    resetDOMCache();
    if (mockDOM.container.parentNode) {
      mockDOM.container.parentNode.removeChild(mockDOM.container);
    }
  });

  describe('initializeDOMCache()', () => {
    it('DOM 요소들을 캐시', () => {
      const cache = initializeDOMCache();
      expect(cache).not.toBeNull();
      expect(cache.ledDisplay).toBeDefined();
      expect(cache.marqueeTrack).toBeDefined();
      expect(cache.seg1).toBeDefined();
    });

    it('두 번째 호출 시 캐시된 값 반환', () => {
      const cache1 = initializeDOMCache();
      const cache2 = initializeDOMCache();
      expect(cache1).toBe(cache2);
    });

    it('필수 요소 없으면 null 반환', () => {
      resetDOMCache();
      // ledDisplay 제거
      mockDOM.ledDisplay.remove();
      const cache = initializeDOMCache();
      expect(cache).toBeNull();
    });
  });

  describe('setText()', () => {
    it('모든 요소에 텍스트 설정', () => {
      setText('Hello World');
      expect(mockDOM.seg1.textContent).toBe('Hello World');
      expect(mockDOM.seg2.textContent).toBe('Hello World');
      expect(mockDOM.staticText.textContent).toBe('Hello World');
    });

    it('빈 텍스트는 기본값 사용', () => {
      setText('');
      expect(mockDOM.seg1.textContent).toBe('여기에 텍스트를 입력하세요');
    });

    it('커스텀 기본값 지정 가능', () => {
      setText('', 'Custom Default');
      expect(mockDOM.seg1.textContent).toBe('Custom Default');
    });

    it('특수문자 처리', () => {
      const text = 'Test !@#$% <>&';
      setText(text);
      expect(mockDOM.seg1.textContent).toBe(text);
    });
  });

  describe('setFontSize()', () => {
    it('폰트 크기 설정', () => {
      setFontSize(48);
      expect(mockDOM.ledDisplay.style.fontSize).toBe('48px');
    });

    it('수치값만 처리', () => {
      setFontSize(120);
      expect(mockDOM.ledDisplay.style.fontSize).toBe('120px');
    });

    it('0도 유효한 값', () => {
      setFontSize(0);
      expect(mockDOM.ledDisplay.style.fontSize).toBe('0px');
    });
  });

  describe('setLetterSpacing()', () => {
    it('자간 설정', () => {
      setLetterSpacing(10);
      expect(mockDOM.ledDisplay.style.letterSpacing).toBe('10px');
    });

    it('음수도 유효', () => {
      setLetterSpacing(-5);
      expect(mockDOM.ledDisplay.style.letterSpacing).toBe('-5px');
    });
  });

  describe('setTextColor()', () => {
    it('텍스트 색상 설정', () => {
      setTextColor('#FF0000');
      // DOM은 색상을 RGB로 정규화하므로 contains로 검증
      expect(mockDOM.ledDisplay.style.color).toMatch(/rgb\(255,\s*0,\s*0\)|#FF0000/i);
    });

    it('텍스트 섀도도 함께 적용', () => {
      setTextColor('#00FF00');
      expect(mockDOM.ledDisplay.style.textShadow).toContain('0 0 10px');
      // 섀도는 설정한 색상이 포함되어야 함
      expect(mockDOM.ledDisplay.style.textShadow).toMatch(/#00FF00|rgb\(0,\s*255,\s*0\)/i);
    });

    it('모든 색상 형식 처리', () => {
      setTextColor('#ABCDEF');
      // DOM이 정규화하므로 색상이 설정되었는지만 확인
      expect(mockDOM.ledDisplay.style.color).toBeTruthy();
    });
  });

  describe('setBackgroundColor()', () => {
    it('배경색 설정', () => {
      setBackgroundColor('#000000');
      // DOM은 색상을 RGB로 정규화
      expect(mockDOM.previewSection.style.backgroundColor).toMatch(/rgb\(0,\s*0,\s*0\)|#000000/i);
    });

    it('다양한 색상 값 처리', () => {
      setBackgroundColor('#123456');
      // 색상이 설정되었는지 확인
      expect(mockDOM.previewSection.style.backgroundColor).toBeTruthy();
    });
  });

  describe('setNeon()', () => {
    it('네온 활성화', () => {
      setNeon(true);
      expect(mockDOM.marqueeTrack.classList.contains('neon')).toBe(true);
      expect(mockDOM.staticText.classList.contains('neon')).toBe(true);
    });

    it('네온 비활성화', () => {
      setNeon(true);
      setNeon(false);
      expect(mockDOM.marqueeTrack.classList.contains('neon')).toBe(false);
      expect(mockDOM.staticText.classList.contains('neon')).toBe(false);
    });
  });

  describe('setFontFamily()', () => {
    it('monospace 폰트 설정', () => {
      setFontFamily('monospace');
      expect(mockDOM.ledDisplay.style.fontFamily).toContain('Courier New');
    });

    it('system 폰트 설정', () => {
      setFontFamily('system');
      expect(mockDOM.ledDisplay.style.fontFamily).toContain('Segoe UI');
    });

    it('rounded 폰트 설정', () => {
      setFontFamily('rounded');
      expect(mockDOM.ledDisplay.style.fontFamily).toContain('Rounded');
    });

    it('seven 폰트 설정', () => {
      setFontFamily('seven');
      expect(mockDOM.ledDisplay.style.fontFamily).toContain('Seven Segment');
    });

    it('유효하지 않은 폰트는 무시', () => {
      const originalFont = mockDOM.ledDisplay.style.fontFamily;
      setFontFamily('invalid');
      expect(mockDOM.ledDisplay.style.fontFamily).toBe(originalFont);
    });
  });

  describe('setAnimationMode()', () => {
    it('scroll 모드 적용', () => {
      setAnimationMode('scroll');
      expect(mockDOM.marqueeTrack.style.display).toBe('flex');
      expect(mockDOM.staticText.classList.contains('show')).toBe(false);
    });

    it('blink 모드 적용', () => {
      setAnimationMode('blink');
      expect(mockDOM.marqueeTrack.style.display).toBe('none');
      expect(mockDOM.staticText.classList.contains('show')).toBe(true);
      expect(mockDOM.staticText.classList.contains('blink')).toBe(true);
    });

    it('pulse 모드 적용', () => {
      setAnimationMode('pulse');
      expect(mockDOM.marqueeTrack.style.display).toBe('none');
      expect(mockDOM.staticText.classList.contains('show')).toBe(true);
      expect(mockDOM.staticText.classList.contains('pulse')).toBe(true);
    });

    it('none 모드 적용', () => {
      setAnimationMode('none');
      expect(mockDOM.marqueeTrack.style.display).toBe('none');
      expect(mockDOM.staticText.classList.contains('show')).toBe(true);
    });

    it('모드 전환 시 이전 클래스 제거', () => {
      setAnimationMode('blink');
      expect(mockDOM.staticText.classList.contains('blink')).toBe(true);
      setAnimationMode('pulse');
      expect(mockDOM.staticText.classList.contains('blink')).toBe(false);
      expect(mockDOM.staticText.classList.contains('pulse')).toBe(true);
    });
  });

  describe('applyScroll()', () => {
    it('스크롤 애니메이션 적용', () => {
      const result = applyScroll(120, 10, 1000);
      expect(result).toBe(true);
      expect(mockDOM.marqueeTrack.classList.contains('run')).toBe(true);
    });

    it('CSS 변수 설정', () => {
      applyScroll(120, 0, 1000);
      const cycleDist = mockDOM.marqueeTrack.style.getPropertyValue('--cycle-distance');
      const duration = mockDOM.marqueeTrack.style.getPropertyValue('--duration-s');
      expect(cycleDist).toBe('200px'); // seg1.scrollWidth = 200
      expect(duration).toContain('s');
    });

    it('시작 오프셋 계산 (vw → px)', () => {
      applyScroll(120, 50, 1000); // 50vw in 1000px viewport = 500px
      expect(mockDOM.marqueeTrack.style.paddingLeft).toBe('500px');
    });

    it('지속시간 계산 (속도 기반)', () => {
      applyScroll(200, 0, 1000); // 200px/s, 200px text = 1s, 하지만 최소값 2s
      const duration = mockDOM.marqueeTrack.style.getPropertyValue('--duration-s');
      // Math.max(2, ...) 때문에 최소값 2s
      expect(duration).toBe('2s');
    });

    it('지속시간 범위 제한 (2s ~ 120s)', () => {
      // 매우 빠른 속도 (1000px/s) → 최소 2s
      applyScroll(1000, 0, 1000);
      const fastDuration = mockDOM.marqueeTrack.style.getPropertyValue('--duration-s');
      expect(parseFloat(fastDuration)).toBeGreaterThanOrEqual(2);

      // 매우 느린 속도 (40px/s, 많은 텍스트) → 최대 120s
      Object.defineProperty(mockDOM.seg1, 'scrollWidth', {
        value: 10000,
        configurable: true
      });
      applyScroll(40, 0, 1000);
      const slowDuration = mockDOM.marqueeTrack.style.getPropertyValue('--duration-s');
      expect(parseFloat(slowDuration)).toBeLessThanOrEqual(120);
    });

    it('유효하지 않은 텍스트 너비는 false 반환', () => {
      Object.defineProperty(mockDOM.seg1, 'scrollWidth', {
        value: 0,
        configurable: true
      });
      const result = applyScroll(120, 0, 1000);
      expect(result).toBe(false);
    });

    it('seg1이 없으면 false 반환', () => {
      // seg1 제거 후 캐시 리셋
      mockDOM.seg1.remove();
      resetDOMCache();
      // 새로 캐시 초기화하면 seg1이 없으므로 false 반환
      const result = applyScroll(120, 0, 1000);
      expect(result).toBe(false);
    });
  });

  describe('applyConfig()', () => {
    it('전체 설정 적용', () => {
      const config = {
        text: 'Test Message',
        fontSize: 64,
        letterSpacing: 5,
        textColor: '#00FF00',
        backgroundColor: '#000000',
        fontFamily: 'monospace',
        animation: 'scroll',
        neon: true,
        speed: 120,
        startOffset: 10
      };
      applyConfig(config);

      expect(mockDOM.seg1.textContent).toBe('Test Message');
      expect(mockDOM.ledDisplay.style.fontSize).toBe('64px');
      // 색상은 DOM이 RGB로 정규화
      expect(mockDOM.ledDisplay.style.color).toBeTruthy();
      expect(mockDOM.previewSection.style.backgroundColor).toBeTruthy();
    });

    it('부분 설정 적용', () => {
      const config = { text: 'Partial', fontSize: 48 };
      applyConfig(config);
      expect(mockDOM.seg1.textContent).toBe('Partial');
      expect(mockDOM.ledDisplay.style.fontSize).toBe('48px');
    });

    it('scroll 모드 시 스크롤 설정 적용', () => {
      const config = {
        animation: 'scroll',
        speed: 120,
        startOffset: 0
      };
      applyConfig(config);
      expect(mockDOM.marqueeTrack.classList.contains('run')).toBe(true);
    });

    it('null 입력 무시', () => {
      const text = mockDOM.seg1.textContent;
      applyConfig(null);
      expect(mockDOM.seg1.textContent).toBe(text);
    });
  });

  describe('isTextOverflow()', () => {
    it('텍스트 오버플로우 감지', () => {
      // scrollWidth=200, viewport=1000 → 오버플로우 없음
      const result = isTextOverflow(1000);
      expect(result).toBe(false);
    });

    it('텍스트 오버플로우 감지 (작은 뷰포트)', () => {
      // scrollWidth=200, viewport=100 → 오버플로우
      const result = isTextOverflow(100);
      expect(result).toBe(true);
    });

    it('window.innerWidth 기본값', () => {
      // 기본값 사용 (테스트 환경의 innerWidth)
      const result = isTextOverflow();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isFullscreenActive()', () => {
    it('전체화면 미활성 상태', () => {
      const result = isFullscreenActive();
      expect(result).toBe(false);
    });

    it('fullscreenElement 감지', () => {
      // jsdom에서 fullscreenElement 정의
      Object.defineProperty(document, 'fullscreenElement', {
        value: mockDOM.previewSection,
        configurable: true
      });
      const result = isFullscreenActive();
      expect(result).toBe(true);
      // 정리
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        configurable: true
      });
    });
  });

  describe('isLandscapeOrientation()', () => {
    it('가로 모드 감지', () => {
      // matchMedia 모킹: '(orientation: landscape)' = true
      const result = isLandscapeOrientation();
      expect(result).toBe(true);
    });

    it('세로 모드 감지', () => {
      vi.spyOn(window, 'matchMedia').mockImplementation(() => ({
        matches: false
      }));
      const result = isLandscapeOrientation();
      expect(result).toBe(false);
    });

    it('matchMedia 미지원 환경 처리', () => {
      const original = window.matchMedia;
      window.matchMedia = undefined;
      window.innerWidth = 800;
      window.innerHeight = 600;
      const result = isLandscapeOrientation();
      expect(result).toBe(true); // 800 > 600
      window.matchMedia = original;
    });
  });

  describe('updateLandscapeHint() & showLandscapeHint()', () => {
    it('풍경 힌트 표시 조건', () => {
      // 조건: 전체화면 없음 AND 오버플로우 AND 세로 모드
      vi.spyOn(window, 'matchMedia').mockImplementation(() => ({
        matches: false // 세로 모드
      }));
      Object.defineProperty(mockDOM.seg1, 'scrollWidth', {
        value: 1500, // 오버플로우 (기본 viewport width > 1500)
        configurable: true
      });
      updateLandscapeHint(1000);
      expect(mockDOM.landscapeHint.classList.contains('show')).toBe(true);
    });

    it('전체화면 시 힌트 숨김', () => {
      // jsdom에서 fullscreenElement 정의
      Object.defineProperty(document, 'fullscreenElement', {
        value: mockDOM.previewSection,
        configurable: true
      });
      updateLandscapeHint(1000);
      expect(mockDOM.landscapeHint.classList.contains('show')).toBe(false);
      // 정리
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        configurable: true
      });
    });

    it('가로 모드 시 힌트 숨김', () => {
      // matchMedia 모킹: landscape = true
      updateLandscapeHint(1000);
      expect(mockDOM.landscapeHint.classList.contains('show')).toBe(false);
    });

    it('직접 showLandscapeHint 호출', () => {
      showLandscapeHint(true);
      expect(mockDOM.landscapeHint.classList.contains('show')).toBe(true);
      showLandscapeHint(false);
      expect(mockDOM.landscapeHint.classList.contains('show')).toBe(false);
    });
  });

  describe('requestFullscreen()', () => {
    it('전체화면 요청', async () => {
      const result = await requestFullscreen();
      expect(typeof result).toBe('boolean');
    });

    it('previewSection이 없으면 false 반환', async () => {
      // previewSection 제거
      mockDOM.previewSection.remove();
      resetDOMCache();
      const result = await requestFullscreen();
      expect(result).toBe(false);
    });
  });

  describe('showFullscreenEditButton()', () => {
    it('편집 버튼 표시', () => {
      showFullscreenEditButton(true);
      expect(mockDOM.fsEditBtn.classList.contains('show')).toBe(true);
    });

    it('편집 버튼 숨김', () => {
      showFullscreenEditButton(false);
      expect(mockDOM.fsEditBtn.classList.contains('show')).toBe(false);
    });
  });

  describe('통합 테스트', () => {
    it('기본 설정 워크플로우', () => {
      const config = {
        text: 'LED Board',
        fontSize: 96,
        textColor: '#00FF00',
        backgroundColor: '#000000',
        animation: 'scroll',
        speed: 120,
        startOffset: 10
      };
      applyConfig(config);

      expect(mockDOM.seg1.textContent).toBe('LED Board');
      expect(mockDOM.ledDisplay.style.fontSize).toBe('96px');
      // 색상은 DOM이 정규화
      expect(mockDOM.ledDisplay.style.color).toBeTruthy();
      expect(mockDOM.previewSection.style.backgroundColor).toBeTruthy();
    });

    it('애니메이션 모드 전환', () => {
      // scroll → blink
      setAnimationMode('scroll');
      expect(mockDOM.marqueeTrack.style.display).toBe('flex');

      setAnimationMode('blink');
      expect(mockDOM.marqueeTrack.style.display).toBe('none');
      expect(mockDOM.staticText.classList.contains('blink')).toBe(true);

      // blink → pulse
      setAnimationMode('pulse');
      expect(mockDOM.staticText.classList.contains('blink')).toBe(false);
      expect(mockDOM.staticText.classList.contains('pulse')).toBe(true);

      // pulse → none
      setAnimationMode('none');
      expect(mockDOM.staticText.classList.contains('pulse')).toBe(false);
    });

    it('색상 및 스타일 스택 적용', () => {
      setTextColor('#FF0000');
      setBackgroundColor('#FFFFFF');
      setFontSize(128);
      setLetterSpacing(8);
      setFontFamily('system');
      setNeon(true);

      // 색상은 DOM이 정규화
      expect(mockDOM.ledDisplay.style.color).toBeTruthy();
      expect(mockDOM.previewSection.style.backgroundColor).toBeTruthy();
      expect(mockDOM.ledDisplay.style.fontSize).toBe('128px');
      expect(mockDOM.ledDisplay.style.letterSpacing).toBe('8px');
      expect(mockDOM.marqueeTrack.classList.contains('neon')).toBe(true);
    });

    it('스크롤 설정 재계산', () => {
      // 첫 번째 스크롤 설정
      applyScroll(120, 10, 1000);
      const paddingLeft1 = mockDOM.marqueeTrack.style.paddingLeft;

      // 두 번째 스크롤 설정 (다른 속도/오프셋)
      applyScroll(200, 50, 1000);
      const paddingLeft2 = mockDOM.marqueeTrack.style.paddingLeft;

      expect(paddingLeft1).not.toBe(paddingLeft2);
      expect(paddingLeft2).toBe('500px'); // 50% of 1000px
    });
  });
});
