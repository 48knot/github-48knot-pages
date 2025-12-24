/**
 * LED 전광판 - 애플리케이션 진입점
 *
 * 책임:
 * - 모듈 초기화
 * - DOM 요소 수집
 * - 모듈 간 통신 설정
 * - 초기 로드
 */

import * as storage from './modules/storage.js';
import * as encoder from './modules/encoder.js';
import * as display from './modules/display.js';
import * as animation from './modules/animation.js';
import * as ui from './modules/ui.js';
import * as validator from './modules/validator.js';

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

    // 1. DOM 요소 수집
    this.collectElements();

    // 2. Display 모듈 초기화 (DOM 캐시)
    display.initializeDOMCache();

    // 3. 이벤트 바인딩 및 상태 업데이트
    this.setupEventListeners();

    // 4. 초기 설정 로드 (URL 또는 localStorage)
    this.loadInitialState();

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
    // 텍스트 입력
    this.elements.textInput?.addEventListener('input', (e) => {
      display.setText(e.target.value);
      this.applyScrollAnimation();
      this.updateDisplay();
    });

    // 글자 크기
    this.elements.fontSizeSlider?.addEventListener('input', (e) => {
      const size = Number(e.target.value);
      display.setFontSize(size);
      this.applyScrollAnimation();
      this.updateDisplay();
    });

    // 자간
    this.elements.letterSpacingSlider?.addEventListener('input', (e) => {
      const spacing = Number(e.target.value);
      display.setLetterSpacing(spacing);
      if (this.elements.letterSpacingSlider) {
        const label = this.elements.letterSpacingSlider.parentElement?.querySelector('.note');
        if (label) label.textContent = spacing;
      }
      this.applyScrollAnimation();
      this.updateDisplay();
    });

    // 글자색
    this.elements.textColorInput?.addEventListener('input', (e) => {
      display.setTextColor(e.target.value);
      this.updateDisplay();
    });

    // 배경색
    this.elements.bgColorInput?.addEventListener('input', (e) => {
      display.setBackgroundColor(e.target.value);
      this.updateDisplay();
    });

    // 폰트 패밀리
    this.elements.fontFamilySelect?.addEventListener('change', (e) => {
      display.setFontFamily(e.target.value);
      this.updateDisplay();
    });

    // 애니메이션 모드
    this.elements.animationSelect?.addEventListener('change', (e) => {
      display.setAnimationMode(e.target.value);
      if (e.target.value === 'scroll') {
        this.applyScrollAnimation();
      }
      this.updateDisplay();
    });

    // 네온 효과
    this.elements.neonToggle?.addEventListener('change', (e) => {
      display.setNeon(e.target.checked);
      this.updateDisplay();
    });

    // 스크롤 속도
    this.elements.speedSlider?.addEventListener('input', (e) => {
      const speed = Number(e.target.value);
      if (this.elements.speedOut) this.elements.speedOut.textContent = speed;
      this.applyScrollAnimation();
    });

    // 시작 오프셋
    this.elements.startOffsetSlider?.addEventListener('input', (e) => {
      const offset = Number(e.target.value);
      if (this.elements.startOut) this.elements.startOut.textContent = offset;
      this.applyScrollAnimation();
    });

    // 세로모드 강제 스크롤
    this.elements.forcePortrait?.addEventListener('change', (e) => {
      this.updateDisplay();
    });

    // 전체화면 버튼
    this.elements.fullscreenBtn?.addEventListener('click', async () => {
      await display.requestFullscreen();
    });

    // 공유 버튼
    this.elements.shareBtn?.addEventListener('click', () => {
      const config = this.getCurrentConfig();
      const encoded = encoder.encodeConfig(config);
      const urlSafeEncoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const url = `${window.location.origin}${window.location.pathname}?config=${urlSafeEncoded}`;
      if (navigator.share) {
        navigator.share({ title: 'LED Board', text: 'Check this out!', url });
      } else {
        alert(`공유 링크:\n${url}\n\n(클립보드에 복사)`);
        navigator.clipboard.writeText(url);
      }
    });

    // 편집 버튼
    this.elements.openEditorBtn?.addEventListener('click', () => {
      ui.openModal(this.elements.editorSheet, this.elements.backdrop);
    });

    this.elements.fsEditBtn?.addEventListener('click', () => {
      ui.openModal(this.elements.editorSheet, this.elements.backdrop);
    });

    // 닫기 버튼
    this.elements.closeEditorBtn?.addEventListener('click', () => {
      ui.closeModal(this.elements.editorSheet, this.elements.backdrop);
    });

    this.elements.backdrop?.addEventListener('click', () => {
      ui.closeModal(this.elements.editorSheet, this.elements.backdrop);
    });

    // 탭
    this.elements.tabButtons?.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        ui.activateTab(tabName, {
          buttons: this.elements.tabButtons,
          panels: {
            basic: this.elements.tabBasic,
            advanced: this.elements.tabAdvanced,
            presets: this.elements.tabPresets
          }
        });
      });
    });

    // 프리셋 저장
    this.elements.savePresetBtn?.addEventListener('click', () => {
      const name = this.elements.presetName?.value || 'Preset';
      const config = this.getCurrentConfig();
      storage.addPreset(name, config);
      this.updatePresetList();
      this.elements.presetName.value = '';
    });

    // 윈도우 리사이즈 시 힌트 업데이트
    window.addEventListener('resize', () => {
      display.updateLandscapeHint();
    });

    // 윈도우 로테이션 감지
    window.addEventListener('orientationchange', () => {
      display.updateLandscapeHint();
    });
  }

  /**
   * 초기 상태 로드 (URL 파라미터 또는 localStorage)
   */
  loadInitialState() {
    // 1. URL 파라미터 확인
    const urlConfig = encoder.getConfigFromURL();
    if (urlConfig) {
      this.applyConfig(urlConfig);
      return;
    }

    // 2. localStorage에서 최신 프리셋 로드
    const presets = storage.loadPresets();
    if (presets.length > 0) {
      // 인덱스 0이 가장 최신 (unshift로 맨 앞에 추가됨)
      const latestPreset = presets[0];
      this.applyConfig(latestPreset.cfg);
      return;
    }

    // 3. 기본값 적용
    const defaultConfig = {
      text: '여기에 텍스트를 입력하세요',
      fontSize: 80,
      letterSpacing: 0,
      textColor: '#00FF00',
      backgroundColor: '#000000',
      animation: 'scroll',
      fontFamily: 'monospace',
      neon: false,
      speed: 120,
      startOffset: 10,
      forcePortrait: false
    };
    this.applyConfig(defaultConfig);
    this.updatePresetList();
  }

  /**
   * 설정을 UI에 적용
   */
  applyConfig(config) {
    if (this.elements.textInput) this.elements.textInput.value = config.text || '';
    if (this.elements.fontSizeSlider) this.elements.fontSizeSlider.value = config.fontSize || 80;
    if (this.elements.letterSpacingSlider) this.elements.letterSpacingSlider.value = config.letterSpacing || 0;
    if (this.elements.textColorInput) this.elements.textColorInput.value = config.textColor || '#00FF00';
    if (this.elements.bgColorInput) this.elements.bgColorInput.value = config.backgroundColor || '#000000';
    if (this.elements.fontFamilySelect) this.elements.fontFamilySelect.value = config.fontFamily || 'monospace';
    if (this.elements.animationSelect) this.elements.animationSelect.value = config.animation || 'scroll';
    if (this.elements.neonToggle) this.elements.neonToggle.checked = !!config.neon;
    if (this.elements.speedSlider) this.elements.speedSlider.value = config.speed || 120;
    if (this.elements.startOffsetSlider) this.elements.startOffsetSlider.value = config.startOffset || 10;
    if (this.elements.forcePortrait) this.elements.forcePortrait.checked = !!config.forcePortrait;

    // Display 업데이트
    display.applyConfig(config);
    this.updateDisplay();
  }

  /**
   * 현재 설정 수집
   */
  getCurrentConfig() {
    return {
      text: this.elements.textInput?.value || '',
      fontSize: Number(this.elements.fontSizeSlider?.value || 80),
      letterSpacing: Number(this.elements.letterSpacingSlider?.value || 0),
      textColor: this.elements.textColorInput?.value || '#00FF00',
      backgroundColor: this.elements.bgColorInput?.value || '#000000',
      fontFamily: this.elements.fontFamilySelect?.value || 'monospace',
      animation: this.elements.animationSelect?.value || 'scroll',
      neon: this.elements.neonToggle?.checked || false,
      speed: Number(this.elements.speedSlider?.value || 120),
      startOffset: Number(this.elements.startOffsetSlider?.value || 10),
      forcePortrait: this.elements.forcePortrait?.checked || false
    };
  }

  /**
   * 스크롤 애니메이션 적용
   */
  applyScrollAnimation() {
    const speed = Number(this.elements.speedSlider?.value || 120);
    const startOffset = Number(this.elements.startOffsetSlider?.value || 10);
    display.applyScroll(speed, startOffset);
  }

  /**
   * 디스플레이 업데이트
   */
  updateDisplay() {
    display.updateLandscapeHint();
  }

  /**
   * 프리셋 목록 업데이트
   */
  updatePresetList() {
    const presets = storage.loadPresets();
    if (!this.elements.presetList) return;

    this.elements.presetList.innerHTML = '';
    presets.forEach((preset, index) => {
      const item = document.createElement('div');
      item.className = 'preset-item';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = preset.name;

      const loadBtn = document.createElement('button');
      loadBtn.textContent = '로드';
      loadBtn.onclick = () => this.loadPreset(index);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '삭제';
      deleteBtn.onclick = () => this.deletePreset(index);

      item.appendChild(nameSpan);
      item.appendChild(loadBtn);
      item.appendChild(deleteBtn);
      this.elements.presetList.appendChild(item);
    });
  }

  /**
   * 프리셋 로드
   */
  loadPreset(index) {
    const presets = storage.loadPresets();
    if (presets[index]) {
      this.applyConfig(presets[index].cfg);
    }
  }

  /**
   * 프리셋 삭제
   */
  deletePreset(index) {
    storage.deletePreset(index);
    this.updatePresetList();
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
