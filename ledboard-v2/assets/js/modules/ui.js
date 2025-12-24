/**
 * UI Module - 사용자 인터페이스 상태 및 이벤트 관리
 *
 * 책임:
 * - UI 요소 가시성 관리
 * - 이벤트 리스너 등록/제거
 * - 탭 패널 전환
 * - 모달 열기/닫기
 * - 슬라이더 및 입력 요소 동기화
 */

/**
 * UI 상태 객체를 생성합니다.
 *
 * @returns {Object} UI 상태
 */
export function createUIState() {
  return {
    editorOpen: false,
    activeTab: 'basic',
    listeners: new Map()
  };
}

/**
 * 모달을 엽니다 (에디터 시트).
 *
 * @param {HTMLElement} editorSheet - 에디터 시트 요소
 * @param {HTMLElement} backdrop - 배경 어두워짐 요소
 * @returns {boolean} 성공 여부
 */
export function openModal(editorSheet, backdrop) {
  if (!editorSheet || !backdrop) return false;

  editorSheet.classList.add('open');
  backdrop.classList.add('open');
  editorSheet.setAttribute('aria-hidden', 'false');

  return true;
}

/**
 * 모달을 닫습니다 (에디터 시트).
 *
 * @param {HTMLElement} editorSheet - 에디터 시트 요소
 * @param {HTMLElement} backdrop - 배경 어두워짐 요소
 * @returns {boolean} 성공 여부
 */
export function closeModal(editorSheet, backdrop) {
  if (!editorSheet || !backdrop) return false;

  editorSheet.classList.remove('open');
  backdrop.classList.remove('open');
  editorSheet.setAttribute('aria-hidden', 'true');

  return true;
}

/**
 * 탭 패널을 활성화합니다.
 *
 * @param {string} tabName - 탭 이름 ('basic', 'advanced', 'presets')
 * @param {Object} tabElements - 탭 요소 객체 { buttons, panels }
 * @returns {boolean} 성공 여부
 */
export function activateTab(tabName, tabElements) {
  if (!tabElements || !tabElements.buttons || !tabElements.panels) {
    return false;
  }

  const validTabs = ['basic', 'advanced', 'presets'];
  if (!validTabs.includes(tabName)) {
    return false;
  }

  // 모든 버튼에서 active 클래스 제거
  tabElements.buttons.forEach(btn => {
    btn.classList.remove('active');
  });

  // 모든 패널에서 active 클래스 제거
  Object.values(tabElements.panels).forEach(panel => {
    if (panel) panel.classList.remove('active');
  });

  // 선택된 탭 활성화
  const activeButton = Array.from(tabElements.buttons).find(
    btn => btn.dataset.tab === tabName
  );
  if (activeButton) {
    activeButton.classList.add('active');
  }

  const activePanel = tabElements.panels[tabName];
  if (activePanel) {
    activePanel.classList.add('active');
  }

  return true;
}

/**
 * 슬라이더의 출력 요소를 업데이트합니다.
 *
 * @param {HTMLElement} slider - 슬라이더 요소
 * @param {HTMLElement} output - 출력 요소
 */
export function updateSliderOutput(slider, output) {
  if (!slider || !output) return;

  output.textContent = slider.value;
}

/**
 * 이벤트 리스너를 등록합니다.
 *
 * @param {HTMLElement} element - 요소
 * @param {string} event - 이벤트 이름
 * @param {Function} handler - 핸들러 함수
 * @param {Map} listenerMap - 리스너 맵 (제거용 추적)
 * @returns {boolean} 성공 여부
 */
export function addEventListener(element, event, handler, listenerMap = null) {
  if (!element || typeof event !== 'string' || typeof handler !== 'function') {
    return false;
  }

  element.addEventListener(event, handler);

  // 리스너 맵에 추가 (제거할 때 필요)
  if (listenerMap instanceof Map) {
    const key = `${element.id}-${event}`;
    if (!listenerMap.has(key)) {
      listenerMap.set(key, []);
    }
    listenerMap.get(key).push({ element, event, handler });
  }

  return true;
}

/**
 * 이벤트 리스너를 제거합니다.
 *
 * @param {HTMLElement} element - 요소
 * @param {string} event - 이벤트 이름
 * @param {Function} handler - 핸들러 함수
 * @returns {boolean} 성공 여부
 */
export function removeEventListener(element, event, handler) {
  if (!element || typeof event !== 'string' || typeof handler !== 'function') {
    return false;
  }

  element.removeEventListener(event, handler);
  return true;
}

/**
 * 모든 이벤트 리스너를 제거합니다 (정리용).
 *
 * @param {Map} listenerMap - 리스너 맵
 * @returns {boolean} 성공 여부
 */
export function removeAllEventListeners(listenerMap) {
  if (!(listenerMap instanceof Map)) {
    return false;
  }

  listenerMap.forEach(listeners => {
    listeners.forEach(({ element, event, handler }) => {
      removeEventListener(element, event, handler);
    });
  });

  listenerMap.clear();
  return true;
}

/**
 * 여러 요소에 같은 이벤트 리스너를 등록합니다.
 *
 * @param {HTMLElement[]} elements - 요소 배열
 * @param {string|string[]} events - 이벤트 이름 또는 배열
 * @param {Function} handler - 핸들러 함수
 * @returns {number} 등록된 리스너 수
 */
export function addMultipleEventListeners(elements, events, handler) {
  if (!Array.isArray(elements) || typeof handler !== 'function') {
    return 0;
  }

  const eventArray = Array.isArray(events) ? events : [events];
  let count = 0;

  elements.forEach(element => {
    eventArray.forEach(event => {
      if (addEventListener(element, event, handler)) {
        count++;
      }
    });
  });

  return count;
}

/**
 * 입력 요소의 값을 설정합니다.
 *
 * @param {HTMLElement} element - 입력 요소
 * @param {string|number|boolean} value - 값
 * @returns {boolean} 성공 여부
 */
export function setInputValue(element, value) {
  if (!element) return false;

  if (element.type === 'checkbox' || element.type === 'radio') {
    element.checked = Boolean(value);
  } else if (element.tagName === 'SELECT') {
    element.value = String(value);
  } else {
    element.value = String(value);
  }

  return true;
}

/**
 * 입력 요소의 값을 가져옵니다.
 *
 * @param {HTMLElement} element - 입력 요소
 * @returns {string|boolean|null} 값
 */
export function getInputValue(element) {
  if (!element) return null;

  if (element.type === 'checkbox' || element.type === 'radio') {
    return element.checked;
  }

  return element.value || null;
}

/**
 * 요소의 가시성을 토글합니다.
 *
 * @param {HTMLElement} element - 요소
 * @param {boolean} [visible] - 명시적 가시성 (생략 시 토글)
 * @returns {boolean} 최종 가시성 상태
 */
export function toggleElementVisibility(element, visible = null) {
  if (!element) return false;

  const shouldShow = visible !== null ? visible : !element.classList.contains('show');

  if (shouldShow) {
    element.classList.add('show');
  } else {
    element.classList.remove('show');
  }

  return shouldShow;
}

/**
 * 요소를 숨깁니다.
 *
 * @param {HTMLElement} element - 요소
 * @returns {boolean} 성공 여부
 */
export function hideElement(element) {
  return toggleElementVisibility(element, false);
}

/**
 * 요소를 표시합니다.
 *
 * @param {HTMLElement} element - 요소
 * @returns {boolean} 성공 여부
 */
export function showElement(element) {
  return toggleElementVisibility(element, true);
}

/**
 * 버튼을 활성화 또는 비활성화합니다.
 *
 * @param {HTMLElement} button - 버튼 요소
 * @param {boolean} enabled - 활성화 여부
 * @returns {boolean} 성공 여부
 */
export function setButtonEnabled(button, enabled) {
  if (!button) return false;

  button.disabled = !enabled;
  return true;
}

/**
 * 요소 내의 HTML을 안전하게 설정합니다.
 *
 * @param {HTMLElement} element - 요소
 * @param {string} html - HTML 문자열
 * @returns {boolean} 성공 여부
 */
export function setElementHTML(element, html) {
  if (!element || typeof html !== 'string') return false;

  element.innerHTML = html;
  return true;
}

/**
 * 요소의 텍스트를 설정합니다.
 *
 * @param {HTMLElement} element - 요소
 * @param {string} text - 텍스트
 * @returns {boolean} 성공 여부
 */
export function setElementText(element, text) {
  if (!element) return false;

  element.textContent = String(text);
  return true;
}

/**
 * 요소에 클래스를 추가합니다.
 *
 * @param {HTMLElement} element - 요소
 * @param {string} className - 클래스 이름
 * @returns {boolean} 성공 여부
 */
export function addClass(element, className) {
  if (!element || typeof className !== 'string') return false;

  element.classList.add(className);
  return true;
}

/**
 * 요소에서 클래스를 제거합니다.
 *
 * @param {HTMLElement} element - 요소
 * @param {string} className - 클래스 이름
 * @returns {boolean} 성공 여부
 */
export function removeClass(element, className) {
  if (!element || typeof className !== 'string') return false;

  element.classList.remove(className);
  return true;
}

/**
 * 요소가 특정 클래스를 포함하는지 확인합니다.
 *
 * @param {HTMLElement} element - 요소
 * @param {string} className - 클래스 이름
 * @returns {boolean} 포함 여부
 */
export function hasClass(element, className) {
  if (!element || typeof className !== 'string') return false;

  return element.classList.contains(className);
}

/**
 * UI 상태를 초기화합니다.
 *
 * @returns {Object} 초기화된 UI 상태
 */
export function resetUIState() {
  return createUIState();
}
