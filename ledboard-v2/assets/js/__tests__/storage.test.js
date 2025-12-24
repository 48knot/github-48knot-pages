/**
 * Storage Module Tests
 *
 * LocalStorage 기반 프리셋 관리 기능 검증
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadPresets,
  savePresets,
  addPreset,
  deletePreset,
  updatePreset,
  findPresetByName,
  clearAllPresets,
  getPresetCount,
  getStorageStatus
} from '../modules/storage.js';

// Mock localStorage (in-memory 구현)
const LOCAL_STORAGE_KEY = 'led-board-presets';

const createLocalStorageMock = () => {
  const store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    }
  };
};

describe('Storage Module', () => {
  beforeEach(() => {
    // 각 테스트 전에 localStorage mock 생성
    const localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    // 테스트 후 정리
    vi.unstubAllGlobals();
  });

  describe('loadPresets()', () => {
    it('빈 localStorage에서 빈 배열 반환', () => {
      const presets = loadPresets();
      expect(presets).toEqual([]);
    });

    it('저장된 프리셋 로드', () => {
      const mockData = [
        { name: 'Test', cfg: { text: 'Hello' }, ts: Date.now() }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockData));

      const presets = loadPresets();
      expect(presets).toEqual(mockData);
      expect(presets.length).toBe(1);
    });

    it('손상된 JSON은 빈 배열 반환 (에러 처리)', () => {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'invalid json {]');

      const presets = loadPresets();
      expect(presets).toEqual([]);
    });
  });

  describe('savePresets()', () => {
    it('프리셋 배열 저장', () => {
      const presets = [
        { name: 'Preset1', cfg: { text: 'Hello' }, ts: Date.now() }
      ];

      savePresets(presets);

      const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
      expect(saved).toEqual(presets);
    });

    it('빈 배열 저장', () => {
      savePresets([]);

      const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
      expect(saved).toEqual([]);
    });

    it('비배열 입력 시 에러 발생', () => {
      expect(() => savePresets('not an array')).toThrow();
      expect(() => savePresets(null)).toThrow();
      expect(() => savePresets(123)).toThrow();
    });

    it('중첩된 객체 저장 가능', () => {
      const presets = [
        {
          name: 'Complex',
          cfg: {
            text: 'Test',
            nested: { deep: { value: 'ok' } }
          },
          ts: Date.now()
        }
      ];

      savePresets(presets);

      const saved = loadPresets();
      expect(saved[0].cfg.nested.deep.value).toBe('ok');
    });
  });

  describe('addPreset()', () => {
    it('새 프리셋 추가', () => {
      const config = { text: 'Hello', fontSize: 48 };
      addPreset('My Preset', config);

      const presets = loadPresets();
      expect(presets.length).toBe(1);
      expect(presets[0].name).toBe('My Preset');
      expect(presets[0].cfg).toEqual(config);
      expect(typeof presets[0].ts).toBe('number');
    });

    it('새 프리셋은 맨 앞에 추가됨 (최신순)', () => {
      addPreset('First', { text: 'First' });
      const firstTs = loadPresets()[0].ts;

      // 약간의 지연 후 두 번째 프리셋 추가
      addPreset('Second', { text: 'Second' });

      const presets = loadPresets();
      expect(presets.length).toBe(2);
      expect(presets[0].name).toBe('Second');
      expect(presets[1].name).toBe('First');
      expect(presets[0].ts).toBeGreaterThanOrEqual(firstTs);
    });

    it('빈 이름은 추가 불가', () => {
      expect(() => addPreset('', { text: 'Hello' })).toThrow();
      expect(() => addPreset('   ', { text: 'Hello' })).toThrow();
      expect(() => addPreset(null, { text: 'Hello' })).toThrow();
    });

    it('유효하지 않은 설정은 추가 불가', () => {
      expect(() => addPreset('Test', null)).toThrow();
      expect(() => addPreset('Test', 'not object')).toThrow();
      expect(() => addPreset('Test', 123)).toThrow();
    });

    it('특수문자와 이모지 포함 가능', () => {
      const name = '테스트 🎉 !@#$%^&*()';
      const config = { text: '안녕하세요 🧦 SKKU94' };

      addPreset(name, config);

      const presets = loadPresets();
      expect(presets[0].name).toBe(name);
      expect(presets[0].cfg.text).toBe(config.text);
    });

    it('설정 객체는 복제되어 저장됨 (참조 분리)', () => {
      const originalConfig = { text: 'Hello', arr: [1, 2, 3] };
      addPreset('Test', originalConfig);

      // 원본 수정
      originalConfig.text = 'Modified';
      originalConfig.arr.push(4);

      const presets = loadPresets();
      expect(presets[0].cfg.text).toBe('Hello');
      expect(presets[0].cfg.arr).toEqual([1, 2, 3]);
    });
  });

  describe('deletePreset()', () => {
    it('프리셋 삭제', () => {
      addPreset('To Delete', { text: 'Delete me' });
      addPreset('To Keep', { text: 'Keep me' });

      deletePreset(1); // 인덱스 1 삭제

      const presets = loadPresets();
      expect(presets.length).toBe(1);
      expect(presets[0].name).toBe('To Keep');
    });

    it('첫 번째 프리셋 삭제', () => {
      addPreset('First', { text: 'First' });
      addPreset('Second', { text: 'Second' });

      deletePreset(0);

      const presets = loadPresets();
      expect(presets.length).toBe(1);
      expect(presets[0].name).toBe('First');
    });

    it('마지막 프리셋 삭제', () => {
      addPreset('A', { text: 'A' });
      addPreset('B', { text: 'B' });

      const count = getPresetCount();
      deletePreset(count - 1);

      const presets = loadPresets();
      expect(presets.length).toBe(count - 1);
    });

    it('유효하지 않은 인덱스는 에러', () => {
      addPreset('Test', { text: 'Test' });

      expect(() => deletePreset(-1)).toThrow();
      expect(() => deletePreset(100)).toThrow();
      expect(() => deletePreset('0')).toThrow();
      expect(() => deletePreset(null)).toThrow();
    });

    it('빈 저장소에서 삭제하면 에러', () => {
      expect(() => deletePreset(0)).toThrow();
    });
  });

  describe('updatePreset()', () => {
    it('프리셋 업데이트', () => {
      addPreset('Original', { text: 'Original' });

      const newConfig = { text: 'Updated', fontSize: 64 };
      updatePreset(0, 'New Name', newConfig);

      const presets = loadPresets();
      expect(presets[0].name).toBe('New Name');
      expect(presets[0].cfg).toEqual(newConfig);
    });

    it('타임스탬프는 업데이트됨', () => {
      addPreset('Test', { text: 'Test' });
      const originalTs = loadPresets()[0].ts;

      // 약간의 지연
      const newConfig = { text: 'Updated' };
      updatePreset(0, 'Test', newConfig);

      const updatedTs = loadPresets()[0].ts;
      expect(updatedTs).toBeGreaterThanOrEqual(originalTs);
    });

    it('유효하지 않은 인덱스는 에러', () => {
      addPreset('Test', { text: 'Test' });

      expect(() => updatePreset(-1, 'Name', {})).toThrow();
      expect(() => updatePreset(100, 'Name', {})).toThrow();
    });

    it('빈 이름은 에러', () => {
      addPreset('Test', { text: 'Test' });

      expect(() => updatePreset(0, '', {})).toThrow();
      expect(() => updatePreset(0, '   ', {})).toThrow();
    });

    it('유효하지 않은 설정은 에러', () => {
      addPreset('Test', { text: 'Test' });

      expect(() => updatePreset(0, 'Name', null)).toThrow();
      expect(() => updatePreset(0, 'Name', 'invalid')).toThrow();
    });
  });

  describe('findPresetByName()', () => {
    it('이름으로 프리셋 찾기', () => {
      addPreset('Unique Name', { text: 'Hello' });

      const preset = findPresetByName('Unique Name');
      expect(preset).not.toBeNull();
      expect(preset.name).toBe('Unique Name');
    });

    it('존재하지 않는 이름은 null', () => {
      addPreset('Test', { text: 'Test' });

      const preset = findPresetByName('Non Existent');
      expect(preset).toBeNull();
    });

    it('정확한 이름 매칭 (대소문자 구분)', () => {
      addPreset('MyPreset', { text: 'Test' });

      expect(findPresetByName('MyPreset')).not.toBeNull();
      expect(findPresetByName('mypreset')).toBeNull();
      expect(findPresetByName('MYPRESET')).toBeNull();
    });

    it('빈 저장소에서 찾기', () => {
      const preset = findPresetByName('Any Name');
      expect(preset).toBeNull();
    });
  });

  describe('clearAllPresets()', () => {
    it('모든 프리셋 삭제', () => {
      addPreset('A', { text: 'A' });
      addPreset('B', { text: 'B' });
      addPreset('C', { text: 'C' });

      clearAllPresets();

      const presets = loadPresets();
      expect(presets).toEqual([]);
    });

    it('성공 반환값', () => {
      addPreset('Test', { text: 'Test' });

      const result = clearAllPresets();
      expect(result).toBe(true);
    });

    it('이미 빈 저장소도 성공', () => {
      const result = clearAllPresets();
      expect(result).toBe(true);
    });
  });

  describe('getPresetCount()', () => {
    it('프리셋 개수 반환', () => {
      expect(getPresetCount()).toBe(0);

      addPreset('A', { text: 'A' });
      expect(getPresetCount()).toBe(1);

      addPreset('B', { text: 'B' });
      expect(getPresetCount()).toBe(2);

      deletePreset(0);
      expect(getPresetCount()).toBe(1);
    });
  });

  describe('getStorageStatus()', () => {
    it('저장소 상태 반환', () => {
      addPreset('Test', { text: 'Hello World' });

      const status = getStorageStatus();

      expect(status).toHaveProperty('count');
      expect(status).toHaveProperty('size');
      expect(status).toHaveProperty('lastUpdated');
      expect(status).toHaveProperty('storageKey');
      expect(status.count).toBe(1);
      expect(status.storageKey).toBe(LOCAL_STORAGE_KEY);
    });

    it('빈 저장소의 상태', () => {
      const status = getStorageStatus();

      expect(status.count).toBe(0);
      expect(status.lastUpdated).toBeNull();
    });

    it('크기 계산 (MB 변환)', () => {
      const longText = 'A'.repeat(1000);
      addPreset('Large', { text: longText });

      const status = getStorageStatus();
      expect(status.size).toMatch(/\d+\.\d+KB/);
    });
  });

  describe('통합 테스트', () => {
    it('전체 워크플로우: 추가 → 로드 → 업데이트 → 삭제', () => {
      // 1. 여러 프리셋 추가
      addPreset('Preset 1', { text: 'First' });
      addPreset('Preset 2', { text: 'Second' });
      addPreset('Preset 3', { text: 'Third' });

      expect(getPresetCount()).toBe(3);

      // 2. 로드 및 검증
      const presets = loadPresets();
      expect(presets[0].name).toBe('Preset 3'); // 최신순
      expect(presets[2].name).toBe('Preset 1');

      // 3. 업데이트
      updatePreset(0, 'Updated Preset 3', { text: 'Updated' });
      const updated = loadPresets();
      expect(updated[0].name).toBe('Updated Preset 3');

      // 4. 삭제
      deletePreset(0);
      expect(getPresetCount()).toBe(2);

      // 5. 모두 삭제
      clearAllPresets();
      expect(getPresetCount()).toBe(0);
    });

    it('대량 프리셋 저장 및 성능', () => {
      const startTime = performance.now();

      // 100개 프리셋 추가
      for (let i = 0; i < 100; i++) {
        addPreset(`Preset ${i}`, { text: `Text ${i}`, number: i });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(getPresetCount()).toBe(100);
      expect(duration).toBeLessThan(5000); // 5초 이내
    });
  });
});
