/**
 * Display Module - DOM 조작 및 스타일 적용
 *
 * 책임:
 * - DOM 요소 업데이트 (텍스트, 색상, 폰트)
 * - CSS 스타일 적용
 * - 애니메이션 모드 관리 (scroll, blink, pulse, none)
 * - 마크키 스크롤 애니메이션 계산 및 적용
 * - 폰트 패밀리 설정
 */

/**
 * DOM 요소 캐시 및 초기화
 * @private
 */
let domCache = null;

/**
 * DOM 요소들을 캐시합니다.
 *
 * @returns {Object|null} DOM 요소 객체 또는 null (요소 없을 때)
 */
export function initializeDOMCache() {
  if (!domCache) {
    domCache = {
      previewSection: document.getElementById('previewSection'),
      ledDisplay: document.getElementById('ledDisplay'),
      marqueeTrack: document.getElementById('marqueeTrack'),
      seg1: document.getElementById('seg1'),
      seg2: document.getElementById('seg2'),
      staticText: document.getElementById('staticText'),
      landscapeHint: document.getElementById('landscapeHint')
    };

    // 필수 요소 검증
    if (!domCache.ledDisplay || !domCache.marqueeTrack) {
      console.warn('Display: Required DOM elements not found');
      return null;
    }
  }

  return domCache;
}

/**
 * DOM 캐시를 초기화합니다 (테스트용).
 * @private
 */
export function resetDOMCache() {
  domCache = null;
}

/**
 * 텍스트를 모든 렌더링 위치에 설정합니다.
 *
 * @param {string} text - 표시할 텍스트
 * @param {string} [fallback='여기에 텍스트를 입력하세요'] - 빈 텍스트일 때 대체 텍스트
 */
export function setText(text, fallback = '여기에 텍스트를 입력하세요') {
  const dom = initializeDOMCache();
  if (!dom) return;

  const displayText = text || fallback;
  if (dom.seg1) dom.seg1.textContent = displayText;
  if (dom.seg2) dom.seg2.textContent = displayText;
  if (dom.staticText) dom.staticText.textContent = displayText;
}

/**
 * 폰트 크기를 설정합니다 (px 단위).
 *
 * @param {number} sizePx - 폰트 크기 (픽셀)
 */
export function setFontSize(sizePx) {
  const dom = initializeDOMCache();
  if (!dom) return;

  if (dom.ledDisplay) {
    dom.ledDisplay.style.fontSize = sizePx + 'px';
  }
}

/**
 * 자간을 설정합니다 (px 단위).
 *
 * @param {number} spacingPx - 자간 (픽셀)
 */
export function setLetterSpacing(spacingPx) {
  const dom = initializeDOMCache();
  if (!dom) return;

  if (dom.ledDisplay) {
    dom.ledDisplay.style.letterSpacing = spacingPx + 'px';
  }
}

/**
 * 텍스트 색상을 설정합니다.
 *
 * @param {string} color - HEX 색상 (#RRGGBB)
 */
export function setTextColor(color) {
  const dom = initializeDOMCache();
  if (!dom) return;

  if (dom.ledDisplay) {
    dom.ledDisplay.style.color = color;
    // 텍스트 섀도도 함께 업데이트 (기본 glow 효과)
    dom.ledDisplay.style.textShadow = `0 0 10px ${color}`;
  }
}

/**
 * 배경색을 설정합니다.
 *
 * @param {string} color - HEX 색상 (#RRGGBB)
 */
export function setBackgroundColor(color) {
  const dom = initializeDOMCache();
  if (!dom) return;

  if (dom.previewSection) {
    dom.previewSection.style.backgroundColor = color;
  }
}

/**
 * 네온 효과를 토글합니다.
 *
 * @param {boolean} enabled - 네온 효과 활성화 여부
 */
export function setNeon(enabled) {
  const dom = initializeDOMCache();
  if (!dom) return;

  if (dom.marqueeTrack) {
    dom.marqueeTrack.classList.toggle('neon', enabled);
  }
  if (dom.staticText) {
    dom.staticText.classList.toggle('neon', enabled);
  }
}

/**
 * 폰트 패밀리를 설정합니다.
 *
 * @param {string} fontFamily - 폰트 패밀리 ('monospace'|'system'|'rounded'|'seven')
 */
export function setFontFamily(fontFamily) {
  const dom = initializeDOMCache();
  if (!dom) return;

  if (!dom.ledDisplay) return;

  switch (fontFamily) {
    case 'monospace':
      dom.ledDisplay.style.fontFamily =
        "'Courier New', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      break;
    case 'system':
      dom.ledDisplay.style.fontFamily =
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
      break;
    case 'rounded':
      dom.ledDisplay.style.fontFamily =
        "'Apple SD Gothic Neo', 'Pretendard', 'Noto Sans KR', 'Segoe UI Rounded', 'SF Pro Rounded', sans-serif";
      break;
    case 'seven':
      dom.ledDisplay.style.fontFamily =
        "'Seven Segment', 'DS-Digital', ui-monospace, Menlo, Consolas, monospace";
      break;
    default:
      break;
  }
}

/**
 * 애니메이션 모드를 적용합니다.
 *
 * @param {string} mode - 애니메이션 모드 ('scroll'|'blink'|'pulse'|'none')
 */
export function setAnimationMode(mode) {
  const dom = initializeDOMCache();
  if (!dom) return;

  // 기존 애니메이션 클래스 제거
  if (dom.marqueeTrack) {
    dom.marqueeTrack.classList.remove('run');
  }
  if (dom.seg1) {
    dom.seg1.className = 'marquee-seg';
  }
  if (dom.seg2) {
    dom.seg2.className = 'marquee-seg';
  }
  if (dom.staticText) {
    dom.staticText.className = 'static-text';
  }

  // 새 모드 적용
  switch (mode) {
    case 'scroll':
      if (dom.marqueeTrack) dom.marqueeTrack.style.display = 'flex';
      if (dom.staticText) dom.staticText.classList.remove('show');
      break;

    case 'blink':
    case 'pulse':
      if (dom.marqueeTrack) dom.marqueeTrack.style.display = 'none';
      if (dom.staticText) {
        dom.staticText.classList.add('show', mode);
      }
      break;

    case 'none':
      if (dom.marqueeTrack) dom.marqueeTrack.style.display = 'none';
      if (dom.staticText) dom.staticText.classList.add('show');
      break;

    default:
      break;
  }
}

/**
 * 마크키 스크롤 애니메이션을 적용합니다.
 *
 * @param {number} speed - 스크롤 속도 (px/s)
 * @param {number} startOffset - 시작 오프셋 (vw)
 * @param {number} [viewportWidth] - 뷰포트 너비 (테스트용, 기본값: window.innerWidth)
 * @returns {boolean} 성공 여부
 */
export function applyScroll(speed, startOffset, viewportWidth = null) {
  const dom = initializeDOMCache();
  if (!dom) return false;

  const vw = viewportWidth || window.innerWidth;
  if (!dom.seg1 || !dom.marqueeTrack) return false;

  // 텍스트 너비 계산
  const textWidth = dom.seg1.scrollWidth;
  if (textWidth <= 0) return false;

  // 시작 오프셋 계산 (픽셀 단위)
  const startPx = (startOffset / 100) * vw;

  // CSS 변수 설정
  dom.marqueeTrack.style.setProperty('--cycle-distance', textWidth + 'px');

  // 속도로부터 애니메이션 지속시간 계산
  const duration = Math.max(2, Math.min(120, textWidth / speed));
  dom.marqueeTrack.style.setProperty('--duration-s', duration + 's');

  // 시작 오프셋 적용
  dom.marqueeTrack.style.paddingLeft = startPx + 'px';

  // 애니메이션 재시작 (강제 리플로우)
  dom.marqueeTrack.classList.remove('run');
  void dom.marqueeTrack.offsetWidth; // 리플로우 강제
  dom.marqueeTrack.classList.add('run');

  return true;
}

/**
 * 전체 설정을 한 번에 적용합니다.
 *
 * @param {Object} config - 설정 객체
 * @param {string} [config.text] - 표시 텍스트
 * @param {number} [config.fontSize] - 폰트 크기 (px)
 * @param {number} [config.letterSpacing] - 자간 (px)
 * @param {string} [config.textColor] - 텍스트 색상 (#RRGGBB)
 * @param {string} [config.backgroundColor] - 배경색 (#RRGGBB)
 * @param {string} [config.fontFamily] - 폰트 패밀리
 * @param {string} [config.animation] - 애니메이션 모드
 * @param {boolean} [config.neon] - 네온 효과 활성화
 * @param {number} [config.speed] - 스크롤 속도 (px/s)
 * @param {number} [config.startOffset] - 시작 오프셋 (vw)
 */
export function applyConfig(config) {
  if (typeof config !== 'object' || config === null) return;

  // 텍스트 색상 먼저 적용 (glow 효과 포함)
  if (config.textColor) setTextColor(config.textColor);
  if (config.backgroundColor) setBackgroundColor(config.backgroundColor);

  // 텍스트 및 기본 스타일
  if (config.text !== undefined) setText(config.text);
  if (config.fontSize !== undefined) setFontSize(config.fontSize);
  if (config.letterSpacing !== undefined) setLetterSpacing(config.letterSpacing);

  // 폰트 및 특수 효과
  if (config.fontFamily) setFontFamily(config.fontFamily);
  if (config.neon !== undefined) setNeon(config.neon);

  // 애니메이션 모드 적용
  if (config.animation) {
    setAnimationMode(config.animation);

    // 스크롤 모드일 때 스크롤 파라미터 적용
    if (config.animation === 'scroll' && config.speed !== undefined && config.startOffset !== undefined) {
      applyScroll(config.speed, config.startOffset);
    }
  }
}

/**
 * 현재 텍스트가 뷰포트를 초과하는지 확인합니다.
 *
 * @param {number} [viewportWidth] - 뷰포트 너비 (테스트용, 기본값: window.innerWidth)
 * @returns {boolean} 텍스트가 오버플로우하는지 여부
 */
export function isTextOverflow(viewportWidth = null) {
  const dom = initializeDOMCache();
  if (!dom || !dom.seg1) return false;

  const vw = viewportWidth || window.innerWidth;
  return dom.seg1.scrollWidth > vw;
}

/**
 * 전체화면 모드 여부를 확인합니다.
 *
 * @returns {boolean} 전체화면 활성화 여부
 */
export function isFullscreenActive() {
  return !!document.fullscreenElement;
}

/**
 * 가로/세로 방향을 확인합니다.
 *
 * @returns {boolean} 가로 모드 여부
 */
export function isLandscapeOrientation() {
  if (window.matchMedia) {
    return window.matchMedia('(orientation: landscape)').matches;
  }
  return (window.innerWidth || 0) > (window.innerHeight || 0);
}

/**
 * 풍경 힌트를 표시합니다.
 *
 * @param {boolean} show - 표시 여부
 */
export function showLandscapeHint(show) {
  const dom = initializeDOMCache();
  if (!dom || !dom.landscapeHint) return;

  dom.landscapeHint.classList.toggle('show', show);
}

/**
 * 풍경 힌트 업데이트 (텍스트 오버플로우 및 모드 확인).
 * 세로모드 + 텍스트 길다 + 강제스크롤 OFF → 힌트 표시
 *
 * @param {number} [viewportWidth] - 뷰포트 너비 (테스트용)
 * @param {boolean} [forcePortrait] - 강제 세로모드 스크롤 (테스트용)
 */
export function updateLandscapeHint(viewportWidth = null, forcePortrait = null) {
  const needScroll = isTextOverflow(viewportWidth);

  // forcePortrait를 동적으로 읽거나 파라미터에서 가져오기
  let forceScrollInPortrait = forcePortrait;
  if (forceScrollInPortrait === null) {
    const forcePortraitCheckbox = document.getElementById('forcePortrait');
    forceScrollInPortrait = forcePortraitCheckbox?.checked ?? false;
  }

  // 세로모드 + 텍스트 오버플로우 + 강제스크롤 OFF → 힌트 표시
  const show = !isFullscreenActive() && needScroll && !isLandscapeOrientation() && !forceScrollInPortrait;

  showLandscapeHint(show);
}

/**
 * 전체화면 요청을 시도합니다.
 *
 * @returns {Promise<boolean>} 성공 여부
 */
export async function requestFullscreen() {
  const dom = initializeDOMCache();
  if (!dom || !dom.previewSection) return false;

  try {
    if (!isFullscreenActive()) {
      await dom.previewSection.requestFullscreen();
      if (dom.previewSection) {
        dom.previewSection.classList.add('fullscreen-mode');
      }
      return true;
    } else {
      await document.exitFullscreen();
      if (dom.previewSection) {
        dom.previewSection.classList.remove('fullscreen-mode');
      }
      return false;
    }
  } catch (error) {
    console.error('Fullscreen error:', error);
    return false;
  }
}

/**
 * 편집 버튼 표시 상태를 업데이트합니다.
 *
 * @param {boolean} show - 표시 여부
 */
export function showFullscreenEditButton(show) {
  const fsEditBtn = document.getElementById('fsEditBtn');
  if (fsEditBtn) {
    fsEditBtn.classList.toggle('show', show);
  }
}
