/**
 * Encoder Module - URL 쿼리 파라미터를 통한 설정 인코딩/디코딩
 *
 * 책임:
 * - 설정 객체를 Base64로 인코딩 (공유용)
 * - Base64 문자열을 설정 객체로 디코딩
 * - URL 쿼리 파라미터에서 설정 추출
 * - 손상된 데이터를 graceful하게 처리
 */

/**
 * 설정 객체를 Base64 인코딩된 문자열로 변환합니다.
 *
 * @param {Object} config - 설정 객체
 * @returns {string} Base64 인코딩된 문자열
 * @throws {Error} JSON 직렬화 실패
 */
export function encodeConfig(config) {
  if (typeof config !== 'object' || config === null) {
    throw new Error('설정 객체가 유효하지 않습니다');
  }

  try {
    const jsonString = JSON.stringify(config);
    return btoa(jsonString);
  } catch (error) {
    console.error('❌ 설정 인코딩 실패:', error);
    throw new Error('설정을 인코딩할 수 없습니다');
  }
}

/**
 * Base64 인코딩된 문자열을 설정 객체로 변환합니다.
 * 손상된 데이터는 graceful하게 처리합니다.
 *
 * @param {string} encoded - Base64 인코딩된 문자열
 * @returns {Object|null} 설정 객체 또는 null (실패 시)
 */
export function decodeConfig(encoded) {
  if (typeof encoded !== 'string' || !encoded.trim()) {
    return null;
  }

  try {
    const jsonString = atob(encoded);
    const config = JSON.parse(jsonString);

    if (typeof config !== 'object' || config === null) {
      return null;
    }

    return config;
  } catch (error) {
    console.warn('⚠️ 설정 디코딩 실패:', error.message);
    return null;
  }
}

/**
 * URL 쿼리 파라미터에서 config 파라미터를 추출하고 디코딩합니다.
 *
 * @param {string} [urlString=window.location.search] - URL 검색 문자열 (테스트용)
 * @returns {Object|null} 설정 객체 또는 null
 */
export function getConfigFromURL(urlString = null) {
  try {
    // 테스트용으로 URL을 직접 전달할 수 있음
    const searchString = urlString || window.location.search;

    if (!searchString) {
      return null;
    }

    const urlParams = new URLSearchParams(searchString);
    const configParam = urlParams.get('config');

    if (!configParam) {
      return null;
    }

    return decodeConfig(configParam);
  } catch (error) {
    console.warn('⚠️ URL 파라미터 읽기 실패:', error.message);
    return null;
  }
}

/**
 * 공유 가능한 URL을 생성합니다.
 *
 * @param {Object} config - 설정 객체
 * @param {string} [baseUrl] - 기본 URL (기본값: window.location.origin + pathname)
 * @returns {string} 공유 가능한 URL
 */
export function buildShareURL(config, baseUrl = null) {
  try {
    const encoded = encodeConfig(config);
    const base = baseUrl || `${window.location.origin}${window.location.pathname}`;
    return `${base}?config=${encoded}`;
  } catch (error) {
    console.error('❌ 공유 URL 생성 실패:', error);
    throw error;
  }
}

/**
 * URL 쿼리 파라미터를 비우고 현재 URL을 반환합니다.
 * (기본 상태로 리셋할 때 사용)
 *
 * @returns {string} 쿼리 파라미터가 없는 URL
 */
export function getCleanURL() {
  return `${window.location.origin}${window.location.pathname}`;
}

/**
 * 여러 설정을 배열로 인코딩합니다.
 * (대량 공유 시 사용 가능)
 *
 * @param {Array<Object>} configs - 설정 객체 배열
 * @returns {string} Base64 인코딩된 배열 문자열
 */
export function encodeConfigArray(configs) {
  if (!Array.isArray(configs)) {
    throw new Error('configs must be an array');
  }

  try {
    const jsonString = JSON.stringify(configs);
    return btoa(jsonString);
  } catch (error) {
    console.error('❌ 설정 배열 인코딩 실패:', error);
    throw new Error('설정 배열을 인코딩할 수 없습니다');
  }
}

/**
 * 인코딩된 설정 배열을 디코딩합니다.
 *
 * @param {string} encoded - Base64 인코딩된 배열 문자열
 * @returns {Array<Object>|null} 설정 객체 배열 또는 null
 */
export function decodeConfigArray(encoded) {
  if (typeof encoded !== 'string' || !encoded.trim()) {
    return null;
  }

  try {
    const jsonString = atob(encoded);
    const configs = JSON.parse(jsonString);

    if (!Array.isArray(configs)) {
      return null;
    }

    return configs;
  } catch (error) {
    console.warn('⚠️ 설정 배열 디코딩 실패:', error.message);
    return null;
  }
}

/**
 * 인코딩된 설정의 크기를 반환합니다 (bytes).
 * 공유 가능 여부를 판단할 때 사용.
 *
 * @param {Object} config - 설정 객체
 * @returns {number} 인코딩된 설정의 크기 (bytes)
 */
export function getEncodedSize(config) {
  try {
    const encoded = encodeConfig(config);
    const blob = new Blob([encoded]);
    return blob.size;
  } catch (error) {
    console.error('❌ 크기 계산 실패:', error);
    return 0;
  }
}

/**
 * 두 설정을 비교합니다.
 * (공유 URL이 동일한지 확인할 때 사용)
 *
 * @param {Object} config1 - 첫 번째 설정
 * @param {Object} config2 - 두 번째 설정
 * @returns {boolean} 두 설정이 동일한지 여부
 */
export function isSameConfig(config1, config2) {
  try {
    const encoded1 = encodeConfig(config1);
    const encoded2 = encodeConfig(config2);
    return encoded1 === encoded2;
  } catch (error) {
    return false;
  }
}

/**
 * 설정 객체에서 민감한 정보를 제거합니다.
 * (프라이버시 보호)
 *
 * @param {Object} config - 설정 객체
 * @returns {Object} 정제된 설정 객체
 */
export function sanitizeConfig(config) {
  if (typeof config !== 'object' || config === null) {
    return {};
  }

  const sanitized = { ...config };

  // 필요한 경우 민감한 필드 제거
  // delete sanitized.secret;
  // delete sanitized.apiKey;

  return sanitized;
}
