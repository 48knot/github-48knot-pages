/**
 * Main Module Tests
 *
 * 애플리케이션 초기화 및 통합 기능 검증
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createAppState,
  collectDOMElements,
  initializeApp,
  loadConfigFromURL,
  applyConfigToUI,
  collectConfigFromUI,
  onInitialized,
  resetAppState,
  cleanupApp,
  validateAppConfig,
  getAppInfo
} from '../modules/main.js';

describe('Main Module', () => {
  let mockElements = {};
  let mockModules = {};

  beforeEach(() => {
    // Mock DOM elements
    mockElements = {
      appContainer: document.createElement('div'),
      previewSection: document.createElement('div'),
      ledDisplay: document.createElement('div'),
      fullscreenBtn: document.createElement('button'),
      shareBtn: document.createElement('button'),
      openEditorBtn: document.createElement('button'),
      marqueeTrack: document.createElement('div'),
      seg1: document.createElement('span'),
      seg2: document.createElement('span'),
      staticText: document.createElement('div'),
      landscapeHint: document.createElement('div'),
      editorSheet: document.createElement('div'),
      closeEditorBtn: document.createElement('button'),
      backdrop: document.createElement('div'),
      textInput: document.createElement('input'),
      fontSizeSlider: document.createElement('input'),
      letterSpacingSlider: document.createElement('input'),
      textColorInput: document.createElement('input'),
      bgColorInput: document.createElement('input'),
      animationSelect: document.createElement('select'),
      fontFamilySelect: document.createElement('select'),
      neonToggle: document.createElement('input'),
      speedSlider: document.createElement('input'),
      startOffsetSlider: document.createElement('input'),
      speedOut: document.createElement('div'),
      startOut: document.createElement('div'),
      forcePortrait: document.createElement('input'),
      savePresetBtn: document.createElement('button'),
      presetName: document.createElement('input'),
      presetList: document.createElement('div'),
      tabButtons: [
        document.createElement('button'),
        document.createElement('button')
      ],
      tabPanels: {
        basic: document.createElement('div'),
        advanced: document.createElement('div'),
        presets: document.createElement('div')
      },
      fsEditBtn: document.createElement('button')
    };

    // Set IDs for DOM collection
    Object.entries(mockElements).forEach(([key, el]) => {
      if (el && typeof el.setAttribute === 'function') {
        el.id = key;
      }
    });

    // Mock modules
    mockModules = {
      display: {
        initializeDOMCache: vi.fn(() => ({ ledDisplay: mockElements.ledDisplay })),
        applyConfig: vi.fn()
      },
      validator: {
        validateConfig: vi.fn((config) => config),
        getValidationErrors: vi.fn(() => [])
      }
    };

    // Mock getElementById
    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      return mockElements[id] || null;
    });

    vi.spyOn(document, 'querySelectorAll').mockImplementation((selector) => {
      if (selector === '.tab-btn') {
        return mockElements.tabButtons;
      }
      return [];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createAppState()', () => {
    it('초기 애플리케이션 상태 생성', () => {
      const state = createAppState();
      expect(state.initialized).toBe(false);
      expect(state.config).toBeNull();
      expect(state.presets).toEqual([]);
      expect(state.listeners).toBeInstanceOf(Map);
    });
  });

  describe('collectDOMElements()', () => {
    it('DOM 요소 수집', () => {
      const elements = collectDOMElements();
      expect(elements).not.toBeNull();
      expect(elements.ledDisplay).toBeDefined();
      expect(elements.marqueeTrack).toBeDefined();
      expect(elements.staticText).toBeDefined();
    });

    it('필수 요소 검증', () => {
      vi.spyOn(document, 'getElementById').mockReturnValue(null);
      const elements = collectDOMElements();
      expect(elements).toBeNull();
    });
  });

  describe('initializeApp()', () => {
    it('애플리케이션 초기화', () => {
      const state = initializeApp(mockModules);
      expect(state).not.toBeNull();
      expect(state.initialized).toBe(true);
      expect(state.domElements).toBeDefined();
    });

    it('유효하지 않은 모듈 처리', () => {
      const state = initializeApp(null);
      expect(state).toBeNull();
    });

    it('DOM 요소 부재 시 초기화 실패', () => {
      vi.spyOn(document, 'getElementById').mockReturnValue(null);
      const state = initializeApp(mockModules);
      expect(state).toBeNull();
    });
  });

  describe('loadConfigFromURL()', () => {
    it('URL에서 설정 로드', () => {
      const mockEncoder = {
        getConfigFromURL: vi.fn(() => ({ text: 'Test', fontSize: 48 }))
      };

      const config = loadConfigFromURL(mockEncoder);
      expect(config).toEqual({ text: 'Test', fontSize: 48 });
      expect(mockEncoder.getConfigFromURL).toHaveBeenCalled();
    });

    it('encoder 없을 때 null 반환', () => {
      const config = loadConfigFromURL(null);
      expect(config).toBeNull();
    });

    it('에러 처리', () => {
      const mockEncoder = {
        getConfigFromURL: vi.fn(() => {
          throw new Error('Load error');
        })
      };

      const config = loadConfigFromURL(mockEncoder);
      expect(config).toBeNull();
    });
  });

  describe('applyConfigToUI()', () => {
    it('설정을 UI에 적용', () => {
      const config = {
        text: 'Hello',
        fontSize: 64,
        letterSpacing: 5,
        textColor: '#FF0000',
        backgroundColor: '#000000',
        animation: 'blink',
        fontFamily: 'system',
        neon: true,
        speed: 150,
        startOffset: 20,
        forcePortrait: false
      };

      const domElements = collectDOMElements();
      const result = applyConfigToUI(config, mockModules, domElements);

      expect(result).toBe(true);
      expect(domElements.textInput.value).toBe('Hello');
      expect(domElements.fontSizeSlider.value).toBe('64');
      expect(domElements.neonToggle.checked).toBe(true);
    });

    it('부분 설정 적용', () => {
      const config = { text: 'Partial' };
      const domElements = collectDOMElements();

      const result = applyConfigToUI(config, mockModules, domElements);
      expect(result).toBe(true);
      expect(domElements.textInput.value).toBe('Partial');
    });

    it('null 설정 처리', () => {
      const domElements = collectDOMElements();
      const result = applyConfigToUI(null, mockModules, domElements);
      expect(result).toBe(false);
    });
  });

  describe('collectConfigFromUI()', () => {
    it('UI에서 설정 수집', () => {
      const domElements = collectDOMElements();
      domElements.textInput.value = 'Test Message';
      domElements.fontSizeSlider.value = '96';
      domElements.neonToggle.checked = true;
      domElements.speedSlider.value = '200';

      const config = collectConfigFromUI(domElements);

      expect(config).not.toBeNull();
      expect(config.text).toBe('Test Message');
      expect(config.fontSize).toBe(96);
      expect(config.neon).toBe(true);
      expect(config.speed).toBe(200);
    });

    it('null 요소 처리 (기본값 사용)', () => {
      const config = collectConfigFromUI(null);
      expect(config).toBeNull();
    });

    it('부분 요소만 있을 때도 작동', () => {
      const partialElements = { textInput: { value: 'Test' } };
      const config = collectConfigFromUI(partialElements);
      expect(config).not.toBeNull();
      expect(config.text).toBe('Test');
    });
  });

  describe('onInitialized()', () => {
    it('초기화 콜백 등록', () => {
      const callback = vi.fn();
      const result = onInitialized(callback);

      expect(result).toBe(true);
      // DOM이 이미 로드된 상태이므로 바로 실행
      expect(callback).toHaveBeenCalled();
    });

    it('유효하지 않은 콜백 거부', () => {
      const result = onInitialized(null);
      expect(result).toBe(false);
    });
  });

  describe('resetAppState()', () => {
    it('애플리케이션 상태 초기화', () => {
      const state = resetAppState();
      expect(state.initialized).toBe(false);
      expect(state.config).toBeNull();
      expect(state.presets).toEqual([]);
    });
  });

  describe('cleanupApp()', () => {
    it('애플리케이션 정리', () => {
      const appState = createAppState();
      appState.initialized = true;

      const result = cleanupApp(appState);
      expect(result).toBe(true);
      expect(appState.initialized).toBe(false);
    });

    it('리스너 정리', () => {
      const appState = createAppState();
      const mockElement = document.createElement('div');
      const mockHandler = vi.fn();

      // 리스너 추가
      appState.listeners.set('test', [
        {
          element: mockElement,
          event: 'click',
          handler: mockHandler
        }
      ]);

      const result = cleanupApp(appState);
      expect(result).toBe(true);
      expect(appState.listeners.size).toBe(0);
    });

    it('null 입력 처리', () => {
      const result = cleanupApp(null);
      expect(result).toBe(false);
    });
  });

  describe('validateAppConfig()', () => {
    it('유효한 설정 검증', () => {
      const config = {
        text: 'Test',
        fontSize: 80,
        animation: 'scroll'
      };

      // validator 함수는 두 개의 메서드를 가진 객체여야 함
      const modules = {
        validator: {
          validateConfig: vi.fn((c) => c),
          getValidationErrors: vi.fn(() => [])
        }
      };

      const result = validateAppConfig(config, modules);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('유효하지 않은 설정', () => {
      const modules = {
        validator: {
          validateConfig: vi.fn((c) => c),
          getValidationErrors: vi.fn(() => ['fontSize 범위 오류'])
        }
      };

      const config = { fontSize: 1000 };
      const result = validateAppConfig(config, modules);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validator 모듈 없음', () => {
      const result = validateAppConfig({}, null);
      expect(result.valid).toBe(false);
    });
  });

  describe('getAppInfo()', () => {
    it('애플리케이션 정보 반환', () => {
      const info = getAppInfo();
      expect(info.name).toBe('LED Board Web App');
      expect(info.version).toBe('2.0.0');
      expect(Array.isArray(info.modules)).toBe(true);
      expect(info.modules).toContain('storage');
      expect(info.modules).toContain('display');
    });
  });

  describe('통합 테스트', () => {
    it('전체 초기화 및 설정 적용 워크플로우', () => {
      // 1. 앱 초기화
      const appState = initializeApp(mockModules);
      expect(appState.initialized).toBe(true);

      // 2. 초기 설정 적용
      const initialConfig = {
        text: 'LED Board',
        fontSize: 96,
        textColor: '#00FF00',
        animation: 'scroll'
      };

      const domElements = appState.domElements;
      const applied = applyConfigToUI(initialConfig, mockModules, domElements);
      expect(applied).toBe(true);

      // 3. UI에서 설정 수집
      const collectedConfig = collectConfigFromUI(domElements);
      expect(collectedConfig.text).toBe('LED Board');
      expect(collectedConfig.fontSize).toBe(96);

      // 4. 설정 검증
      const validatorModules = {
        validator: {
          validateConfig: vi.fn((c) => c),
          getValidationErrors: vi.fn(() => [])
        }
      };
      const validation = validateAppConfig(collectedConfig, validatorModules);
      expect(validation.valid).toBe(true);

      // 5. 정리
      const cleaned = cleanupApp(appState);
      expect(cleaned).toBe(true);
    });

    it('URL 기반 설정 로드 및 적용', () => {
      const mockEncoder = {
        getConfigFromURL: vi.fn(() => ({
          text: 'Loaded Config',
          fontSize: 72,
          animation: 'pulse'
        }))
      };

      // URL에서 설정 로드
      const config = loadConfigFromURL(mockEncoder);
      expect(config).not.toBeNull();

      // 앱 초기화
      const appState = initializeApp(mockModules);

      // 설정 적용
      const domElements = appState.domElements;
      applyConfigToUI(config, mockModules, domElements);

      // 검증
      expect(domElements.textInput.value).toBe('Loaded Config');
      expect(domElements.fontSizeSlider.value).toBe('72');
    });

    it('여러 설정 변경 및 수집', () => {
      const appState = initializeApp(mockModules);
      const domElements = appState.domElements;

      // 초기 설정 적용
      const config1 = {
        text: 'First',
        fontSize: 64,
        neon: false
      };
      applyConfigToUI(config1, mockModules, domElements);

      // 첫 번째 수집
      let collected = collectConfigFromUI(domElements);
      expect(collected.text).toBe('First');
      expect(collected.neon).toBe(false);

      // 설정 변경
      const config2 = {
        text: 'Second',
        fontSize: 100,
        neon: true
      };
      applyConfigToUI(config2, mockModules, domElements);

      // 두 번째 수집
      collected = collectConfigFromUI(domElements);
      expect(collected.text).toBe('Second');
      expect(collected.fontSize).toBe(100);
      expect(collected.neon).toBe(true);
    });

    it('다중 유효성 검사 시나리오', () => {
      const validConfigs = [
        { text: 'Valid 1', fontSize: 64 },
        { text: 'Valid 2', animation: 'blink' },
        { text: 'Valid 3', speed: 150, startOffset: 20 }
      ];

      validConfigs.forEach(config => {
        const result = validateAppConfig(config, mockModules);
        // mockModules.validator는 항상 유효하다고 반환하도록 설정됨
        expect(result).toHaveProperty('valid');
        expect(result).toHaveProperty('errors');
      });
    });
  });
});
