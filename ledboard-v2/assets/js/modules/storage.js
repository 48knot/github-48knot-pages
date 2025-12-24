/**
 * Storage Module - LocalStorage 기반 프리셋 관리
 *
 * 책임:
 * - 프리셋 저장/로드/삭제/업데이트
 * - JSON 직렬화/역직렬화
 * - 에러 처리 (손상된 데이터)
 *
 * 프리셋 구조:
 * {
 *   name: string,
 *   cfg: { ...설정 객체... },
 *   ts: number (timestamp)
 * }
 */

const PRESET_KEY = 'led-board-presets';

/**
 * LocalStorage에서 모든 프리셋을 로드합니다.
 * JSON 파싱 실패 시 빈 배열을 반환합니다.
 *
 * @returns {Array<Object>} 프리셋 배열 또는 빈 배열
 */
export function loadPresets() {
  try {
    const data = localStorage.getItem(PRESET_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ 프리셋 로드 실패:', error);
    return [];
  }
}

/**
 * 프리셋 배열을 LocalStorage에 저장합니다.
 *
 * @param {Array<Object>} presets - 저장할 프리셋 배열
 * @throws {Error} LocalStorage 저장 실패
 */
export function savePresets(presets) {
  try {
    if (!Array.isArray(presets)) {
      throw new TypeError('presets must be an array');
    }
    localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
  } catch (error) {
    console.error('❌ 프리셋 저장 실패:', error);
    throw error;
  }
}

/**
 * 새로운 프리셋을 추가합니다.
 * 기존 프리셋 목록의 맨 앞에 추가됩니다 (최신순).
 *
 * @param {string} name - 프리셋 이름
 * @param {Object} config - 설정 객체
 * @throws {Error} 유효하지 않은 입력
 */
export function addPreset(name, config) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('프리셋 이름은 필수입니다');
  }

  if (typeof config !== 'object' || config === null) {
    throw new Error('설정 객체가 유효하지 않습니다');
  }

  const presets = loadPresets();
  const newPreset = {
    name: name.trim(),
    cfg: { ...config },
    ts: Date.now()
  };

  presets.unshift(newPreset);
  savePresets(presets);

  return newPreset;
}

/**
 * 지정된 인덱스의 프리셋을 삭제합니다.
 *
 * @param {number} index - 프리셋 인덱스
 * @throws {Error} 유효하지 않은 인덱스
 */
export function deletePreset(index) {
  if (typeof index !== 'number' || index < 0) {
    throw new Error('유효한 인덱스를 입력해주세요');
  }

  const presets = loadPresets();

  if (index >= presets.length) {
    throw new Error('프리셋을 찾을 수 없습니다');
  }

  presets.splice(index, 1);
  savePresets(presets);
}

/**
 * 지정된 인덱스의 프리셋을 업데이트합니다.
 *
 * @param {number} index - 프리셋 인덱스
 * @param {string} name - 새 프리셋 이름
 * @param {Object} config - 새 설정 객체
 * @throws {Error} 유효하지 않은 입력
 */
export function updatePreset(index, name, config) {
  if (typeof index !== 'number' || index < 0) {
    throw new Error('유효한 인덱스를 입력해주세요');
  }

  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('프리셋 이름은 필수입니다');
  }

  if (typeof config !== 'object' || config === null) {
    throw new Error('설정 객체가 유효하지 않습니다');
  }

  const presets = loadPresets();

  if (index >= presets.length) {
    throw new Error('프리셋을 찾을 수 없습니다');
  }

  presets[index] = {
    name: name.trim(),
    cfg: { ...config },
    ts: Date.now()
  };

  savePresets(presets);

  return presets[index];
}

/**
 * 특정 이름의 프리셋을 찾습니다.
 *
 * @param {string} name - 프리셋 이름
 * @returns {Object|null} 프리셋 객체 또는 null
 */
export function findPresetByName(name) {
  const presets = loadPresets();
  return presets.find(p => p.name === name) || null;
}

/**
 * 모든 프리셋을 삭제합니다 (초기화).
 *
 * @returns {boolean} 성공 여부
 */
export function clearAllPresets() {
  try {
    localStorage.removeItem(PRESET_KEY);
    return true;
  } catch (error) {
    console.error('❌ 프리셋 초기화 실패:', error);
    return false;
  }
}

/**
 * 프리셋 개수를 반환합니다.
 *
 * @returns {number} 프리셋 개수
 */
export function getPresetCount() {
  return loadPresets().length;
}

/**
 * 프리셋 저장소의 상태를 반환합니다 (디버깅용).
 *
 * @returns {Object} 저장소 상태 정보
 */
export function getStorageStatus() {
  const presets = loadPresets();
  const size = new Blob([JSON.stringify(presets)]).size;

  return {
    count: presets.length,
    size: `${(size / 1024).toFixed(2)}KB`,
    lastUpdated: presets.length > 0 ? new Date(presets[0].ts).toISOString() : null,
    storageKey: PRESET_KEY
  };
}
