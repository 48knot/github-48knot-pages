/**
 * Main Module - 애플리케이션 초기화 및 통합
 *
 * 책임:
 * - 모든 모듈 초기화
 * - DOM 요소 매핑
 * - 이벤트 리스너 설정
 * - 애플리케이션 라이프사이클 관리
 */

/**
 * 애플리케이션 상태 객체를 생성합니다.
 *
 * @returns {Object} 애플리케이션 상태
 */
export function createAppState() {
  return {
    initialized: false,
    config: null,
    presets: [],
    animationState: null,
    uiState: null,
    listeners: new Map()
  };
}

/**
 * DOM 요소들을 수집합니다.
 *
 * @returns {Object|null} DOM 요소 맵 또는 null (필수 요소 부재 시)
 */
export function collectDOMElements() {
  const elements = {
    // 컨테이너
    appContainer: document.getElementById('appContainer'),
    previewSection: document.getElementById('previewSection'),
    ledDisplay: document.getElementById('ledDisplay'),

    // 탑바
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    shareBtn: document.getElementById('shareBtn'),
    openEditorBtn: document.getElementById('openEditorBtn'),

    // 마크키 스크롤
    marqueeTrack: document.getElementById('marqueeTrack'),
    seg1: document.getElementById('seg1'),
    seg2: document.getElementById('seg2'),
    staticText: document.getElementById('staticText'),

    // 힌트
    landscapeHint: document.getElementById('landscapeHint'),

    // 편집 시트
    editorSheet: document.getElementById('editorSheet'),
    closeEditorBtn: document.getElementById('closeEditorBtn'),
    backdrop: document.getElementById('backdrop'),

    // 입력 요소
    textInput: document.getElementById('textInput'),
    fontSizeSlider: document.getElementById('fontSizeSlider'),
    letterSpacingSlider: document.getElementById('letterSpacingSlider'),
    textColorInput: document.getElementById('textColorInput'),
    bgColorInput: document.getElementById('bgColorInput'),
    animationSelect: document.getElementById('animationSelect'),
    fontFamilySelect: document.getElementById('fontFamilySelect'),
    neonToggle: document.getElementById('neonToggle'),
    speedSlider: document.getElementById('speedSlider'),
    startOffsetSlider: document.getElementById('startOffsetSlider'),
    speedOut: document.getElementById('speedOut'),
    startOut: document.getElementById('startOut'),
    forcePortrait: document.getElementById('forcePortrait'),

    // 프리셋 관련
    savePresetBtn: document.getElementById('savePresetBtn'),
    presetName: document.getElementById('presetName'),
    presetList: document.getElementById('presetList'),

    // 탭
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanels: {
      basic: document.getElementById('tab-basic'),
      advanced: document.getElementById('tab-advanced'),
      presets: document.getElementById('tab-presets')
    },

    // 전체화면 편집 버튼
    fsEditBtn: document.getElementById('fsEditBtn')
  };

  // 필수 요소 검증
  if (!elements.ledDisplay || !elements.marqueeTrack || !elements.staticText) {
    console.warn('Main: Required DOM elements not found');
    return null;
  }

  return elements;
}

/**
 * 애플리케이션을 초기화합니다.
 *
 * @param {Object} modules - 초기화할 모듈 객체
 * @returns {Object|null} 초기화된 애플리케이션 상태 또는 null
 */
export function initializeApp(modules) {
  // 입력 검증
  if (typeof modules !== 'object' || modules === null) {
    console.error('Main: Invalid modules');
    return null;
  }

  // DOM 요소 수집
  const domElements = collectDOMElements();
  if (!domElements) {
    console.error('Main: Failed to collect DOM elements');
    return null;
  }

  // 애플리케이션 상태 생성
  const appState = createAppState();

  // DOM 캐시 초기화 (display 모듈)
  if (modules.display && typeof modules.display.initializeDOMCache === 'function') {
    modules.display.initializeDOMCache();
  }

  appState.initialized = true;
  appState.domElements = domElements;

  return appState;
}

/**
 * URL에서 config를 로드합니다.
 *
 * @param {Object} encoder - encoder 모듈
 * @returns {Object|null} 로드된 config 또는 null
 */
export function loadConfigFromURL(encoder) {
  if (!encoder || typeof encoder.getConfigFromURL !== 'function') {
    return null;
  }

  try {
    const config = encoder.getConfigFromURL();
    return config;
  } catch (error) {
    console.error('Main: Error loading config from URL:', error);
    return null;
  }
}

/**
 * 설정을 적용합니다.
 *
 * @param {Object} config - 적용할 설정
 * @param {Object} modules - 모듈 객체
 * @param {Object} domElements - DOM 요소 맵
 * @returns {boolean} 성공 여부
 */
export function applyConfigToUI(config, modules, domElements) {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  if (!modules || !domElements) {
    return false;
  }

  try {
    // display 모듈로 설정 적용
    if (modules.display && typeof modules.display.applyConfig === 'function') {
      modules.display.applyConfig(config);
    }

    // UI 요소 업데이트
    if (domElements.textInput) domElements.textInput.value = config.text || '';
    if (domElements.fontSizeSlider) domElements.fontSizeSlider.value = config.fontSize || 80;
    if (domElements.letterSpacingSlider) {
      domElements.letterSpacingSlider.value = config.letterSpacing || 0;
    }
    if (domElements.textColorInput) domElements.textColorInput.value = config.textColor || '#00FF00';
    if (domElements.bgColorInput) {
      domElements.bgColorInput.value = config.backgroundColor || '#000000';
    }
    if (domElements.animationSelect) domElements.animationSelect.value = config.animation || 'scroll';
    if (domElements.fontFamilySelect) {
      domElements.fontFamilySelect.value = config.fontFamily || 'monospace';
    }
    if (domElements.neonToggle) domElements.neonToggle.checked = !!config.neon;
    if (domElements.speedSlider) domElements.speedSlider.value = config.speed || 120;
    if (domElements.startOffsetSlider) domElements.startOffsetSlider.value = config.startOffset || 10;
    if (domElements.forcePortrait) domElements.forcePortrait.checked = !!config.forcePortrait;

    // 출력 요소 업데이트
    if (domElements.speedOut) domElements.speedOut.textContent = config.speed || 120;
    if (domElements.startOut) domElements.startOut.textContent = config.startOffset || 10;

    return true;
  } catch (error) {
    console.error('Main: Error applying config to UI:', error);
    return false;
  }
}

/**
 * 설정을 UI에서 수집합니다.
 *
 * @param {Object} domElements - DOM 요소 맵
 * @returns {Object|null} 수집된 설정 또는 null
 */
export function collectConfigFromUI(domElements) {
  if (!domElements) {
    return null;
  }

  try {
    return {
      text: domElements.textInput?.value || '',
      fontSize: Number(domElements.fontSizeSlider?.value || 80),
      letterSpacing: Number(domElements.letterSpacingSlider?.value || 0),
      textColor: domElements.textColorInput?.value || '#00FF00',
      backgroundColor: domElements.bgColorInput?.value || '#000000',
      animation: domElements.animationSelect?.value || 'scroll',
      fontFamily: domElements.fontFamilySelect?.value || 'monospace',
      neon: domElements.neonToggle?.checked || false,
      speed: Number(domElements.speedSlider?.value || 120),
      startOffset: Number(domElements.startOffsetSlider?.value || 10),
      forcePortrait: domElements.forcePortrait?.checked || false
    };
  } catch (error) {
    console.error('Main: Error collecting config from UI:', error);
    return null;
  }
}

/**
 * 초기화 콜백을 설정합니다.
 *
 * @param {Function} callback - 콜백 함수
 * @returns {boolean} 성공 여부
 */
export function onInitialized(callback) {
  if (typeof callback !== 'function') {
    return false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }

  return true;
}

/**
 * 애플리케이션 상태를 초기화합니다.
 *
 * @returns {Object} 초기화된 상태
 */
export function resetAppState() {
  return createAppState();
}

/**
 * 애플리케이션을 정리합니다 (라이프사이클 종료).
 *
 * @param {Object} appState - 애플리케이션 상태
 * @returns {boolean} 성공 여부
 */
export function cleanupApp(appState) {
  if (typeof appState !== 'object' || appState === null) {
    return false;
  }

  // 리스너 맵 정리
  if (appState.listeners instanceof Map) {
    appState.listeners.forEach(listeners => {
      listeners.forEach(({ element, event, handler }) => {
        if (element && event && handler) {
          element.removeEventListener(event, handler);
        }
      });
    });
    appState.listeners.clear();
  }

  appState.initialized = false;

  return true;
}

/**
 * 애플리케이션 설정을 검증합니다.
 *
 * @param {Object} config - 검증할 설정
 * @param {Object} modules - 모듈 객체
 * @returns {Object} 검증 결과 { valid: boolean, errors: string[] }
 */
export function validateAppConfig(config, modules) {
  if (!modules || !modules.validator) {
    return { valid: false, errors: ['validator 모듈 없음'] };
  }

  if (typeof config !== 'object' || config === null) {
    return { valid: false, errors: ['유효하지 않은 설정'] };
  }

  try {
    const validated = modules.validator.validateConfig(config);
    const errors = modules.validator.getValidationErrors(config);

    return {
      valid: errors.length === 0,
      errors: errors,
      validated: validated
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`검증 오류: ${error.message}`]
    };
  }
}

/**
 * 애플리케이션 정보를 반환합니다.
 *
 * @returns {Object} 애플리케이션 정보
 */
export function getAppInfo() {
  return {
    name: 'LED Board Web App',
    version: '2.0.0',
    modules: [
      'storage',
      'encoder',
      'validator',
      'display',
      'animation',
      'ui',
      'main'
    ]
  };
}
