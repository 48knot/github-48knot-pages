/**
 * Validator Module - 입력 데이터 검증 및 정규화
 *
 * 책임:
 * - 텍스트, 숫자, 색상 등 입력값 검증
 * - 범위 확인 (min/max)
 * - 열거형 값 검증 (animation, fontFamily 등)
 * - 전체 설정 객체 검증
 * - 기본값 제공
 */

/**
 * 텍스트 입력값을 검증 및 정규화합니다.
 *
 * @param {string} text - 입력 텍스트
 * @param {Object} [options={}] - 옵션
 * @param {number} [options.maxLength] - 최대 길이 (제한 없으면 무시)
 * @returns {string} 정규화된 텍스트
 */
export function validateText(text) {
  if (typeof text !== 'string') {
    return '';
  }
  return text.trim();
}

/**
 * 글자 크기를 검증 및 정규화합니다.
 * 범위: 20 ~ 240 px
 *
 * @param {number} size - 입력 크기 (px)
 * @returns {number} 범위 내의 정규화된 크기
 */
export function validateFontSize(size) {
  if (size === null || size === undefined) {
    return 80; // 기본값
  }

  const numSize = Number(size);

  if (isNaN(numSize)) {
    return 80; // 기본값
  }

  return Math.max(20, Math.min(240, Math.round(numSize)));
}

/**
 * 자간을 검증 및 정규화합니다.
 * 범위: 0 ~ 40 px
 *
 * @param {number} spacing - 입력 자간 (px)
 * @returns {number} 범위 내의 정규화된 자간
 */
export function validateLetterSpacing(spacing) {
  if (spacing === null || spacing === undefined) {
    return 0; // 기본값
  }

  const numSpacing = Number(spacing);

  if (isNaN(numSpacing)) {
    return 0; // 기본값
  }

  return Math.max(0, Math.min(40, Math.round(numSpacing)));
}

/**
 * 색상값을 검증합니다 (16진수 HEX 형식).
 *
 * @param {string} color - 입력 색상 (#RRGGBB 형식)
 * @param {string} [defaultColor='#000000'] - 기본 색상
 * @returns {string} 검증된 색상 또는 기본값
 */
export function validateColor(color, defaultColor = '#000000') {
  // HEX 색상 정규식: #RRGGBB (3자리 또는 6자리)
  const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

  if (typeof color === 'string' && hexRegex.test(color)) {
    return color.toUpperCase();
  }

  return defaultColor.toUpperCase();
}

/**
 * RGB 색상을 HEX로 변환합니다.
 *
 * @param {number} r - Red (0~255)
 * @param {number} g - Green (0~255)
 * @param {number} b - Blue (0~255)
 * @returns {string} HEX 색상 (#RRGGBB)
 */
export function rgbToHex(r, g, b) {
  const hex = (value) => {
    const h = Math.round(value).toString(16);
    return h.length === 1 ? '0' + h : h;
  };

  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

/**
 * HEX 색상을 RGB로 변환합니다.
 *
 * @param {string} hex - HEX 색상 (#RRGGBB)
 * @returns {Object} { r, g, b } 또는 null (유효하지 않음)
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

/**
 * 애니메이션 모드를 검증합니다.
 * 유효한 값: 'scroll', 'blink', 'pulse', 'none'
 *
 * @param {string} animation - 입력 애니메이션 모드
 * @returns {string} 검증된 애니메이션 모드
 */
export function validateAnimation(animation) {
  const validAnimations = ['scroll', 'blink', 'pulse', 'none'];

  if (typeof animation === 'string' && validAnimations.includes(animation)) {
    return animation;
  }

  return 'scroll'; // 기본값
}

/**
 * 폰트 패밀리를 검증합니다.
 * 유효한 값: 'monospace', 'system', 'rounded', 'seven'
 *
 * @param {string} fontFamily - 입력 폰트 패밀리
 * @returns {string} 검증된 폰트 패밀리
 */
export function validateFontFamily(fontFamily) {
  const validFonts = ['monospace', 'system', 'rounded', 'seven'];

  if (typeof fontFamily === 'string' && validFonts.includes(fontFamily)) {
    return fontFamily;
  }

  return 'monospace'; // 기본값
}

/**
 * 스크롤 속도를 검증 및 정규화합니다 (px/s).
 * 범위: 40 ~ 300 px/s
 *
 * @param {number} speed - 입력 속도 (px/s)
 * @returns {number} 범위 내의 정규화된 속도
 */
export function validateSpeed(speed) {
  if (speed === null || speed === undefined) {
    return 120; // 기본값
  }

  const numSpeed = Number(speed);

  if (isNaN(numSpeed)) {
    return 120; // 기본값
  }

  return Math.max(40, Math.min(300, Math.round(numSpeed)));
}

/**
 * 시작 오프셋을 검증 및 정규화합니다 (vw).
 * 범위: 0 ~ 100 vw
 *
 * @param {number} offset - 입력 오프셋 (vw)
 * @returns {number} 범위 내의 정규화된 오프셋
 */
export function validateStartOffset(offset) {
  if (offset === null || offset === undefined) {
    return 10; // 기본값
  }

  const numOffset = Number(offset);

  if (isNaN(numOffset)) {
    return 10; // 기본값
  }

  return Math.max(0, Math.min(100, Math.round(numOffset)));
}

/**
 * 부울린 값을 검증합니다.
 *
 * @param {boolean} value - 입력값
 * @returns {boolean} 검증된 부울린 값
 */
export function validateBoolean(value) {
  return Boolean(value);
}

/**
 * 전체 설정 객체를 검증 및 정규화합니다.
 *
 * @param {Object} config - 입력 설정 객체
 * @returns {Object} 검증된 설정 객체 (모든 필드 포함)
 */
export function validateConfig(config) {
  if (typeof config !== 'object' || config === null) {
    return getDefaultConfig();
  }

  return {
    // 기본 설정
    text: validateText(config.text ?? ''),
    fontSize: validateFontSize(config.fontSize),
    letterSpacing: validateLetterSpacing(config.letterSpacing),
    textColor: validateColor(config.textColor, '#00FF00'),
    backgroundColor: validateColor(config.backgroundColor, '#000000'),

    // 폰트 및 애니메이션
    fontFamily: validateFontFamily(config.fontFamily),
    animation: validateAnimation(config.animation),
    neon: validateBoolean(config.neon),

    // 고급 설정
    speed: validateSpeed(config.speed),
    startOffset: validateStartOffset(config.startOffset),
    forcePortrait: validateBoolean(config.forcePortrait)
  };
}

/**
 * 기본 설정 객체를 반환합니다.
 *
 * @returns {Object} 기본 설정
 */
export function getDefaultConfig() {
  return {
    text: '',
    fontSize: 80,
    letterSpacing: 0,
    textColor: '#00FF00',
    backgroundColor: '#000000',
    fontFamily: 'monospace',
    animation: 'scroll',
    neon: false,
    speed: 120,
    startOffset: 10,
    forcePortrait: false
  };
}

/**
 * 두 설정이 동등한지 비교합니다 (깊은 비교).
 *
 * @param {Object} config1 - 첫 번째 설정
 * @param {Object} config2 - 두 번째 설정
 * @returns {boolean} 두 설정이 동등한지 여부
 */
export function isConfigEqual(config1, config2) {
  try {
    return JSON.stringify(config1) === JSON.stringify(config2);
  } catch (error) {
    return false;
  }
}

/**
 * 부분 설정을 검증된 기본 설정과 병합합니다.
 *
 * @param {Object} partialConfig - 부분 설정
 * @param {Object} [baseConfig] - 기본 설정 (기본값: getDefaultConfig())
 * @returns {Object} 병합된 설정
 */
export function mergeConfig(partialConfig, baseConfig = null) {
  const base = baseConfig || getDefaultConfig();

  if (typeof partialConfig !== 'object' || partialConfig === null) {
    return base;
  }

  return {
    ...base,
    ...validateConfig(partialConfig)
  };
}

/**
 * 설정 객체의 유효하지 않은 필드를 찾아 배열로 반환합니다 (검증 리포트).
 *
 * @param {Object} config - 검증할 설정 객체
 * @returns {Array<string>} 유효하지 않은 필드 목록
 */
export function getValidationErrors(config) {
  const errors = [];

  if (typeof config !== 'object' || config === null) {
    return ['설정 객체가 유효하지 않습니다'];
  }

  // 각 필드 검증
  if (config.fontSize !== undefined && (config.fontSize < 20 || config.fontSize > 240)) {
    errors.push('fontSize는 20~240 사이여야 합니다');
  }

  if (config.letterSpacing !== undefined && (config.letterSpacing < 0 || config.letterSpacing > 40)) {
    errors.push('letterSpacing은 0~40 사이여야 합니다');
  }

  if (config.textColor !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(config.textColor)) {
    errors.push('textColor는 유효한 HEX 색상이어야 합니다');
  }

  if (config.backgroundColor !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(config.backgroundColor)) {
    errors.push('backgroundColor는 유효한 HEX 색상이어야 합니다');
  }

  if (config.animation !== undefined && !['scroll', 'blink', 'pulse', 'none'].includes(config.animation)) {
    errors.push("animation은 'scroll', 'blink', 'pulse', 'none' 중 하나여야 합니다");
  }

  if (config.fontFamily !== undefined && !['monospace', 'system', 'rounded', 'seven'].includes(config.fontFamily)) {
    errors.push("fontFamily는 'monospace', 'system', 'rounded', 'seven' 중 하나여야 합니다");
  }

  if (config.speed !== undefined && (config.speed < 40 || config.speed > 300)) {
    errors.push('speed는 40~300 사이여야 합니다');
  }

  if (config.startOffset !== undefined && (config.startOffset < 0 || config.startOffset > 100)) {
    errors.push('startOffset은 0~100 사이여야 합니다');
  }

  return errors;
}
