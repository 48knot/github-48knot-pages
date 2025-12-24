/**
 * LED 전광판 - 애플리케이션 진입점
 *
 * 책임:
 * - 모듈 초기화
 * - DOM 요소 수집
 * - 모듈 간 통신 설정
 * - 초기 로드
 */

// TODO: 모듈 임포트 추가
// import { StorageManager } from './modules/storage.js';
// import { DisplayManager } from './modules/display.js';
// import { AnimationManager } from './modules/animation.js';
// import { UIManager } from './modules/ui.js';
// import { getConfigFromURL } from './modules/encoder.js';
// import { validateConfig } from './modules/validator.js';

class LedBoardApp {
  constructor() {
    this.initialized = false;
    this.modules = {};
  }

  /**
   * 애플리케이션 초기화
   */
  init() {
    if (this.initialized) return;

    console.log('🎬 LED Board 앱 초기화 중...');

    // TODO: DOM 요소 수집
    // this.collectElements();

    // TODO: 모듈 초기화
    // this.initializeModules();

    // TODO: 이벤트 바인딩
    // this.setupEventListeners();

    // TODO: 초기 설정 로드
    // this.loadInitialState();

    this.initialized = true;
    console.log('✅ LED Board 앱 준비 완료');
  }

  /**
   * DOM 요소 수집
   */
  collectElements() {
    // topbar
    this.elements = {
      // 버튼들
      fullscreenBtn: document.getElementById('fullscreenBtn'),
      shareBtn: document.getElementById('shareBtn'),
      openEditorBtn: document.getElementById('openEditorBtn'),
      closeEditorBtn: document.getElementById('closeEditorBtn'),
      fsEditBtn: document.getElementById('fsEditBtn'),

      // 프리뷰
      previewSection: document.getElementById('previewSection'),
      ledDisplay: document.getElementById('ledDisplay'),
      marqueeTrack: document.getElementById('marqueeTrack'),
      staticText: document.getElementById('staticText'),
      landscapeHint: document.getElementById('landscapeHint'),

      // 에디터
      editorSheet: document.getElementById('editorSheet'),
      backdrop: document.getElementById('backdrop'),

      // 입력 필드 (기본)
      textInput: document.getElementById('textInput'),
      fontSizeSlider: document.getElementById('fontSizeSlider'),
      letterSpacingSlider: document.getElementById('letterSpacingSlider'),
      textColorInput: document.getElementById('textColorInput'),
      bgColorInput: document.getElementById('bgColorInput'),
      fontFamilySelect: document.getElementById('fontFamilySelect'),
      animationSelect: document.getElementById('animationSelect'),
      neonToggle: document.getElementById('neonToggle'),

      // 입력 필드 (고급)
      speedSlider: document.getElementById('speedSlider'),
      speedOut: document.getElementById('speedOut'),
      startOffsetSlider: document.getElementById('startOffsetSlider'),
      startOut: document.getElementById('startOut'),
      forcePortrait: document.getElementById('forcePortrait'),

      // 프리셋
      presetName: document.getElementById('presetName'),
      savePresetBtn: document.getElementById('savePresetBtn'),
      presetList: document.getElementById('presetList'),

      // 탭
      tabButtons: document.querySelectorAll('.tab-btn'),
      tabBasic: document.getElementById('tab-basic'),
      tabAdvanced: document.getElementById('tab-advanced'),
      tabPresets: document.getElementById('tab-presets')
    };
  }

  /**
   * 모듈 초기화
   */
  initializeModules() {
    // TODO: 각 모듈 초기화
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // TODO: 모든 이벤트 리스너 등록
  }

  /**
   * 초기 상태 로드 (URL 파라미터 또는 localStorage)
   */
  loadInitialState() {
    // TODO: URL 파라미터 확인
    // TODO: 없으면 localStorage에서 로드
    // TODO: 없으면 기본값 적용
  }
}

/**
 * 앱 시작
 */
document.addEventListener('DOMContentLoaded', () => {
  const app = new LedBoardApp();
  app.init();

  // 전역 앱 객체 (디버깅용)
  window.__ledBoardApp = app;
});
