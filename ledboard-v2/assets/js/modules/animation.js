/**
 * Animation Module - 애니메이션 상태 및 타이밍 관리
 *
 * 책임:
 * - 애니메이션 타입 관리 (scroll, blink, pulse, none)
 * - 애니메이션 속도/지속시간 계산
 * - 애니메이션 상태 추적
 * - CSS 애니메이션 파라미터 제공
 */

/**
 * 지원하는 애니메이션 타입
 * @type {string[]}
 */
const ANIMATION_TYPES = ['scroll', 'blink', 'pulse', 'none'];

/**
 * 애니메이션 기본값
 * @type {Object}
 */
const DEFAULT_ANIMATION_CONFIG = {
  scroll: {
    speedMin: 40,
    speedMax: 300,
    speedDefault: 120,
    durationMin: 2,
    durationMax: 120
  },
  blink: {
    period: 1000, // 1초 주기
    onDuration: 500, // 켜진 시간
    offDuration: 500 // 꺼진 시간
  },
  pulse: {
    period: 2000, // 2초 주기
    scaleMin: 1,
    scaleMax: 1.1
  }
};

/**
 * 애니메이션 타입이 유효한지 확인합니다.
 *
 * @param {string} type - 애니메이션 타입
 * @returns {boolean} 유효 여부
 */
export function isValidAnimationType(type) {
  return typeof type === 'string' && ANIMATION_TYPES.includes(type);
}

/**
 * 지원하는 애니메이션 타입 목록을 반환합니다.
 *
 * @returns {string[]} 애니메이션 타입 배열
 */
export function getSupportedAnimationTypes() {
  return [...ANIMATION_TYPES];
}

/**
 * 스크롤 애니메이션 지속시간을 계산합니다.
 *
 * @param {number} textWidth - 텍스트 너비 (px)
 * @param {number} speed - 스크롤 속도 (px/s)
 * @returns {number} 지속시간 (초), 범위: 2~120초
 */
export function calculateScrollDuration(textWidth, speed) {
  const config = DEFAULT_ANIMATION_CONFIG.scroll;

  // 입력 검증
  if (typeof textWidth !== 'number' || textWidth <= 0) return config.durationMin;
  if (typeof speed !== 'number' || speed <= 0) return config.durationMin;

  // 지속시간 = 거리 / 속도
  const duration = textWidth / speed;

  // 범위 제한
  return Math.max(config.durationMin, Math.min(config.durationMax, duration));
}

/**
 * 스크롤 속도를 정규화합니다.
 *
 * @param {number} speed - 입력 속도 (px/s)
 * @returns {number} 정규화된 속도, 범위: 40~300 px/s
 */
export function normalizeScrollSpeed(speed) {
  const config = DEFAULT_ANIMATION_CONFIG.scroll;

  if (speed === null || speed === undefined) {
    return config.speedDefault;
  }

  const numSpeed = Number(speed);
  if (isNaN(numSpeed)) {
    return config.speedDefault;
  }

  return Math.max(config.speedMin, Math.min(config.speedMax, Math.round(numSpeed)));
}

/**
 * Blink 애니메이션 설정을 반환합니다.
 *
 * @returns {Object} Blink 애니메이션 설정
 */
export function getBlinkConfig() {
  return { ...DEFAULT_ANIMATION_CONFIG.blink };
}

/**
 * Pulse 애니메이션 설정을 반환합니다.
 *
 * @returns {Object} Pulse 애니메이션 설정
 */
export function getPulseConfig() {
  return { ...DEFAULT_ANIMATION_CONFIG.pulse };
}

/**
 * 스크롤 애니메이션 설정을 반환합니다.
 *
 * @returns {Object} 스크롤 애니메이션 설정
 */
export function getScrollConfig() {
  return { ...DEFAULT_ANIMATION_CONFIG.scroll };
}

/**
 * 주어진 애니메이션 타입에 대한 설정을 반환합니다.
 *
 * @param {string} animationType - 애니메이션 타입
 * @returns {Object|null} 애니메이션 설정 또는 null
 */
export function getAnimationConfig(animationType) {
  if (!isValidAnimationType(animationType)) {
    return null;
  }

  switch (animationType) {
    case 'scroll':
      return getScrollConfig();
    case 'blink':
      return getBlinkConfig();
    case 'pulse':
      return getPulseConfig();
    case 'none':
      return { type: 'none' };
    default:
      return null;
  }
}

/**
 * 애니메이션 프레임 요청을 래핑합니다 (테스트 용이성).
 *
 * @param {Function} callback - 애니메이션 콜백
 * @returns {number} 요청 ID
 */
export function requestAnimationFramePolyfill(callback) {
  return typeof window !== 'undefined' && window.requestAnimationFrame
    ? window.requestAnimationFrame(callback)
    : setTimeout(callback, 16); // 약 60fps
}

/**
 * 애니메이션 프레임 요청을 취소합니다 (테스트 용이성).
 *
 * @param {number} id - 요청 ID
 * @returns {void}
 */
export function cancelAnimationFramePolyfill(id) {
  if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
    window.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * 애니메이션 상태 객체를 생성합니다.
 *
 * @param {string} type - 애니메이션 타입
 * @returns {Object} 애니메이션 상태
 */
export function createAnimationState(type) {
  return {
    type: isValidAnimationType(type) ? type : 'none',
    isRunning: false,
    startTime: null,
    pausedTime: 0
  };
}

/**
 * 애니메이션 상태를 시작합니다.
 *
 * @param {Object} state - 애니메이션 상태
 * @returns {Object} 업데이트된 상태
 */
export function startAnimation(state) {
  let baseState;

  if (typeof state !== 'object' || state === null) {
    baseState = createAnimationState('none');
  } else {
    baseState = state;
  }

  return {
    ...baseState,
    isRunning: true,
    startTime: Date.now(),
    pausedTime: 0
  };
}

/**
 * 애니메이션 상태를 일시 중지합니다.
 *
 * @param {Object} state - 애니메이션 상태
 * @returns {Object} 업데이트된 상태
 */
export function pauseAnimation(state) {
  if (typeof state !== 'object' || state === null) {
    return state;
  }

  if (!state.isRunning) {
    return state;
  }

  const elapsed = Date.now() - (state.startTime || Date.now());

  return {
    ...state,
    isRunning: false,
    pausedTime: (state.pausedTime || 0) + elapsed
  };
}

/**
 * 애니메이션 상태를 재개합니다.
 *
 * @param {Object} state - 애니메이션 상태
 * @returns {Object} 업데이트된 상태
 */
export function resumeAnimation(state) {
  let baseState;

  if (typeof state !== 'object' || state === null) {
    baseState = createAnimationState('none');
  } else {
    baseState = state;
  }

  return {
    ...baseState,
    isRunning: true,
    startTime: Date.now()
  };
}

/**
 * 애니메이션 상태를 초기화합니다.
 *
 * @param {Object} state - 애니메이션 상태
 * @returns {Object} 초기화된 상태
 */
export function resetAnimation(state) {
  if (typeof state !== 'object' || state === null) {
    return createAnimationState('none');
  }

  return {
    type: state.type || 'none',
    isRunning: false,
    startTime: null,
    pausedTime: 0
  };
}

/**
 * 현재 애니메이션 진행도 (0~1)를 계산합니다.
 *
 * @param {Object} state - 애니메이션 상태
 * @param {number} duration - 전체 애니메이션 지속시간 (ms)
 * @returns {number} 진행도 (0~1)
 */
export function getAnimationProgress(state, duration) {
  if (typeof state !== 'object' || state === null || typeof duration !== 'number') {
    return 0;
  }

  if (!state.isRunning || !state.startTime) {
    return 0;
  }

  const elapsed = Date.now() - state.startTime + (state.pausedTime || 0);
  const progress = elapsed / duration;

  // 0~1 범위로 제한
  return Math.min(1, Math.max(0, progress));
}

/**
 * 애니메이션이 실행 중인지 확인합니다.
 *
 * @param {Object} state - 애니메이션 상태
 * @returns {boolean} 실행 중 여부
 */
export function isAnimationRunning(state) {
  return typeof state === 'object' && state !== null && !!state.isRunning;
}

/**
 * 애니메이션 상태 정보를 문자열로 반환합니다 (디버깅용).
 *
 * @param {Object} state - 애니메이션 상태
 * @returns {string} 상태 정보
 */
export function getAnimationStateDebugInfo(state) {
  if (typeof state !== 'object' || state === null) {
    return 'Invalid animation state';
  }

  return `Animation[type=${state.type}, running=${state.isRunning}, startTime=${state.startTime}, paused=${state.pausedTime}ms]`;
}
