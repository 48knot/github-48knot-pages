/**
 * UI Module Tests
 *
 * 사용자 인터페이스 상태 및 이벤트 관리 기능 검증
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createUIState,
  openModal,
  closeModal,
  activateTab,
  updateSliderOutput,
  addEventListener,
  removeEventListener,
  removeAllEventListeners,
  addMultipleEventListeners,
  setInputValue,
  getInputValue,
  toggleElementVisibility,
  hideElement,
  showElement,
  setButtonEnabled,
  setElementHTML,
  setElementText,
  addClass,
  removeClass,
  hasClass,
  resetUIState
} from '../modules/ui.js';

describe('UI Module', () => {
  let mockElements = {};

  beforeEach(() => {
    // Mock DOM elements
    mockElements = {
      editorSheet: document.createElement('div'),
      backdrop: document.createElement('div'),
      slider: document.createElement('input'),
      output: document.createElement('div'),
      input: document.createElement('input'),
      button: document.createElement('button'),
      checkbox: document.createElement('input'),
      select: document.createElement('select'),
      panel: document.createElement('div'),
      tabButtons: [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button')
      ],
      tabPanels: {
        basic: document.createElement('div'),
        advanced: document.createElement('div'),
        presets: document.createElement('div')
      }
    };

    // Configure elements
    mockElements.slider.type = 'range';
    mockElements.slider.value = '50';
    mockElements.checkbox.type = 'checkbox';
    mockElements.select.innerHTML = '<option value="a">A</option>';
    mockElements.tabButtons.forEach((btn, i) => {
      btn.dataset.tab = ['basic', 'advanced', 'presets'][i];
    });
  });

  describe('createUIState()', () => {
    it('초기 UI 상태 생성', () => {
      const state = createUIState();
      expect(state.editorOpen).toBe(false);
      expect(state.activeTab).toBe('basic');
      expect(state.listeners).toBeInstanceOf(Map);
    });
  });

  describe('openModal()', () => {
    it('모달 열기', () => {
      const result = openModal(mockElements.editorSheet, mockElements.backdrop);
      expect(result).toBe(true);
      expect(mockElements.editorSheet.classList.contains('open')).toBe(true);
      expect(mockElements.backdrop.classList.contains('open')).toBe(true);
      expect(mockElements.editorSheet.getAttribute('aria-hidden')).toBe('false');
    });

    it('null 입력 처리', () => {
      const result = openModal(null, mockElements.backdrop);
      expect(result).toBe(false);
    });
  });

  describe('closeModal()', () => {
    it('모달 닫기', () => {
      // 먼저 열기
      openModal(mockElements.editorSheet, mockElements.backdrop);

      // 닫기
      const result = closeModal(mockElements.editorSheet, mockElements.backdrop);
      expect(result).toBe(true);
      expect(mockElements.editorSheet.classList.contains('open')).toBe(false);
      expect(mockElements.backdrop.classList.contains('open')).toBe(false);
      expect(mockElements.editorSheet.getAttribute('aria-hidden')).toBe('true');
    });

    it('닫지 않은 모달 닫기 시도', () => {
      const result = closeModal(mockElements.editorSheet, mockElements.backdrop);
      expect(result).toBe(true);
    });
  });

  describe('activateTab()', () => {
    it('탭 활성화', () => {
      const tabElements = {
        buttons: mockElements.tabButtons,
        panels: mockElements.tabPanels
      };

      const result = activateTab('advanced', tabElements);
      expect(result).toBe(true);

      // advanced 탭이 활성화되어야 함
      const advButton = mockElements.tabButtons[1];
      expect(advButton.classList.contains('active')).toBe(true);
      expect(mockElements.tabPanels.advanced.classList.contains('active')).toBe(true);

      // 다른 탭은 비활성화
      expect(mockElements.tabButtons[0].classList.contains('active')).toBe(false);
    });

    it('유효하지 않은 탭 이름', () => {
      const tabElements = {
        buttons: mockElements.tabButtons,
        panels: mockElements.tabPanels
      };

      const result = activateTab('invalid', tabElements);
      expect(result).toBe(false);
    });

    it('누락된 탭 요소 처리', () => {
      const result = activateTab('basic', null);
      expect(result).toBe(false);
    });
  });

  describe('updateSliderOutput()', () => {
    it('슬라이더 출력 업데이트', () => {
      mockElements.slider.value = '75';
      updateSliderOutput(mockElements.slider, mockElements.output);
      expect(mockElements.output.textContent).toBe('75');
    });

    it('null 요소 처리', () => {
      updateSliderOutput(null, mockElements.output);
      // 에러 없이 처리되어야 함
      expect(mockElements.output.textContent).toBe('');
    });
  });

  describe('addEventListener & removeEventListener', () => {
    it('이벤트 리스너 등록', () => {
      const handler = vi.fn();
      const result = addEventListener(mockElements.button, 'click', handler);
      expect(result).toBe(true);

      mockElements.button.click();
      expect(handler).toHaveBeenCalled();
    });

    it('이벤트 리스너 제거', () => {
      const handler = vi.fn();
      addEventListener(mockElements.button, 'click', handler);

      mockElements.button.click();
      expect(handler).toHaveBeenCalledTimes(1);

      removeEventListener(mockElements.button, 'click', handler);

      mockElements.button.click();
      expect(handler).toHaveBeenCalledTimes(1); // 여전히 1번
    });

    it('리스너 맵 추적', () => {
      const listenerMap = new Map();
      const handler = vi.fn();
      addEventListener(mockElements.button, 'click', handler, listenerMap);

      expect(listenerMap.size).toBe(1);
    });

    it('유효하지 않은 입력 처리', () => {
      const handler = vi.fn();
      const result = addEventListener(null, 'click', handler);
      expect(result).toBe(false);
    });
  });

  describe('removeAllEventListeners()', () => {
    it('모든 리스너 제거', () => {
      const listenerMap = new Map();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      addEventListener(mockElements.button, 'click', handler1, listenerMap);
      addEventListener(mockElements.input, 'change', handler2, listenerMap);

      expect(listenerMap.size).toBe(2);

      removeAllEventListeners(listenerMap);
      expect(listenerMap.size).toBe(0);
    });
  });

  describe('addMultipleEventListeners()', () => {
    it('여러 요소에 리스너 등록', () => {
      const handler = vi.fn();
      const count = addMultipleEventListeners(
        [mockElements.button, mockElements.input],
        'click',
        handler
      );

      expect(count).toBe(2);
    });

    it('여러 이벤트 등록', () => {
      const handler = vi.fn();
      const count = addMultipleEventListeners(
        [mockElements.button],
        ['click', 'change'],
        handler
      );

      expect(count).toBe(2);
    });
  });

  describe('setInputValue & getInputValue', () => {
    it('텍스트 입력 값 설정 및 조회', () => {
      setInputValue(mockElements.input, 'Hello');
      expect(getInputValue(mockElements.input)).toBe('Hello');
    });

    it('체크박스 값 설정 및 조회', () => {
      setInputValue(mockElements.checkbox, true);
      expect(getInputValue(mockElements.checkbox)).toBe(true);

      setInputValue(mockElements.checkbox, false);
      expect(getInputValue(mockElements.checkbox)).toBe(false);
    });

    it('선택 요소 값 설정 및 조회', () => {
      setInputValue(mockElements.select, 'a');
      expect(getInputValue(mockElements.select)).toBe('a');
    });

    it('null 요소 처리', () => {
      const result = getInputValue(null);
      expect(result).toBeNull();
    });
  });

  describe('toggleElementVisibility()', () => {
    it('요소 가시성 토글', () => {
      const visible1 = toggleElementVisibility(mockElements.panel);
      expect(visible1).toBe(true);
      expect(mockElements.panel.classList.contains('show')).toBe(true);

      const visible2 = toggleElementVisibility(mockElements.panel);
      expect(visible2).toBe(false);
      expect(mockElements.panel.classList.contains('show')).toBe(false);
    });

    it('명시적 가시성 설정', () => {
      toggleElementVisibility(mockElements.panel, true);
      expect(mockElements.panel.classList.contains('show')).toBe(true);

      toggleElementVisibility(mockElements.panel, false);
      expect(mockElements.panel.classList.contains('show')).toBe(false);
    });

    it('null 요소 처리', () => {
      const result = toggleElementVisibility(null);
      expect(result).toBe(false);
    });
  });

  describe('hideElement & showElement', () => {
    it('요소 숨기기', () => {
      showElement(mockElements.panel);
      expect(mockElements.panel.classList.contains('show')).toBe(true);

      hideElement(mockElements.panel);
      expect(mockElements.panel.classList.contains('show')).toBe(false);
    });

    it('요소 표시하기', () => {
      hideElement(mockElements.panel);
      expect(mockElements.panel.classList.contains('show')).toBe(false);

      showElement(mockElements.panel);
      expect(mockElements.panel.classList.contains('show')).toBe(true);
    });
  });

  describe('setButtonEnabled', () => {
    it('버튼 활성화', () => {
      setButtonEnabled(mockElements.button, true);
      expect(mockElements.button.disabled).toBe(false);
    });

    it('버튼 비활성화', () => {
      setButtonEnabled(mockElements.button, false);
      expect(mockElements.button.disabled).toBe(true);
    });
  });

  describe('setElementHTML & setElementText', () => {
    it('요소 HTML 설정', () => {
      const html = '<span>Test</span>';
      setElementHTML(mockElements.panel, html);
      expect(mockElements.panel.innerHTML).toBe(html);
    });

    it('요소 텍스트 설정', () => {
      setElementText(mockElements.panel, 'Hello World');
      expect(mockElements.panel.textContent).toBe('Hello World');
    });

    it('null 요소 처리', () => {
      const result = setElementHTML(null, '<p>Test</p>');
      expect(result).toBe(false);
    });
  });

  describe('addClass & removeClass & hasClass', () => {
    it('클래스 추가', () => {
      addClass(mockElements.panel, 'active');
      expect(hasClass(mockElements.panel, 'active')).toBe(true);
    });

    it('클래스 제거', () => {
      addClass(mockElements.panel, 'active');
      removeClass(mockElements.panel, 'active');
      expect(hasClass(mockElements.panel, 'active')).toBe(false);
    });

    it('클래스 확인', () => {
      expect(hasClass(mockElements.panel, 'active')).toBe(false);
      addClass(mockElements.panel, 'active');
      expect(hasClass(mockElements.panel, 'active')).toBe(true);
    });

    it('null 요소 처리', () => {
      const result = addClass(null, 'active');
      expect(result).toBe(false);
    });
  });

  describe('resetUIState()', () => {
    it('UI 상태 초기화', () => {
      const state = resetUIState();
      expect(state.editorOpen).toBe(false);
      expect(state.activeTab).toBe('basic');
      expect(state.listeners).toBeInstanceOf(Map);
    });
  });

  describe('통합 테스트', () => {
    it('모달 열기/닫기 워크플로우', () => {
      expect(mockElements.editorSheet.classList.contains('open')).toBe(false);

      openModal(mockElements.editorSheet, mockElements.backdrop);
      expect(mockElements.editorSheet.classList.contains('open')).toBe(true);

      closeModal(mockElements.editorSheet, mockElements.backdrop);
      expect(mockElements.editorSheet.classList.contains('open')).toBe(false);
    });

    it('탭 전환 워크플로우', () => {
      const tabElements = {
        buttons: mockElements.tabButtons,
        panels: mockElements.tabPanels
      };

      activateTab('basic', tabElements);
      expect(mockElements.tabPanels.basic.classList.contains('active')).toBe(true);

      activateTab('advanced', tabElements);
      expect(mockElements.tabPanels.advanced.classList.contains('active')).toBe(true);
      expect(mockElements.tabPanels.basic.classList.contains('active')).toBe(false);

      activateTab('presets', tabElements);
      expect(mockElements.tabPanels.presets.classList.contains('active')).toBe(true);
    });

    it('입력 및 이벤트 완전 워크플로우', () => {
      const handler = vi.fn();

      // 초기값 설정
      setInputValue(mockElements.input, 'Test');
      expect(getInputValue(mockElements.input)).toBe('Test');

      // 이벤트 리스너 등록
      addEventListener(mockElements.input, 'change', handler);

      // 값 변경 및 이벤트 발생
      setInputValue(mockElements.input, 'Changed');
      mockElements.input.dispatchEvent(new Event('change'));
      expect(handler).toHaveBeenCalled();
    });

    it('여러 요소 상태 관리', () => {
      // 여러 패널 관리
      const panels = [mockElements.panel, mockElements.editorSheet];

      panels.forEach(panel => showElement(panel));
      panels.forEach(panel => expect(hasClass(panel, 'show')).toBe(true));

      panels.forEach(panel => hideElement(panel));
      panels.forEach(panel => expect(hasClass(panel, 'show')).toBe(false));
    });
  });
});
