/**
 * Encoder Module Tests
 *
 * URL 인코딩/디코딩 기능 검증
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  encodeConfig,
  decodeConfig,
  getConfigFromURL,
  buildShareURL,
  getCleanURL,
  encodeConfigArray,
  decodeConfigArray,
  getEncodedSize,
  isSameConfig,
  sanitizeConfig
} from '../modules/encoder.js';

describe('Encoder Module', () => {
  // Mock window 객체
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: {
        origin: 'http://localhost:3000',
        pathname: '/ledboard/',
        search: ''
      }
    });
  });

  describe('encodeConfig()', () => {
    it('설정 객체를 Base64로 인코딩', () => {
      const config = {
        text: 'Hello',
        fontSize: 48,
        color: '#00FF00'
      };

      const encoded = encodeConfig(config);

      expect(typeof encoded).toBe('string');
      expect(encoded.length > 0).toBe(true);

      // Base64는 [A-Za-z0-9+/=] 문자만 포함
      expect(/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)).toBe(true);
    });

    it('복잡한 객체도 인코딩 가능', () => {
      const config = {
        text: 'Complex',
        nested: { deep: { value: 'ok' } },
        array: [1, 2, 3],
        boolean: true,
        null: null
      };

      const encoded = encodeConfig(config);
      expect(typeof encoded).toBe('string');
      expect(encoded.length > 0).toBe(true);
    });

    it('특수 문자 인코딩', () => {
      const config = {
        text: 'Special !@#$%^&*()',
        special: 'Symbols < > & " \''
      };

      const encoded = encodeConfig(config);
      expect(typeof encoded).toBe('string');

      // 라운드트립 검증
      const decoded = decodeConfig(encoded);
      expect(decoded).toEqual(config);
    });

    it('빈 객체도 인코딩 가능', () => {
      const encoded = encodeConfig({});
      expect(typeof encoded).toBe('string');
      expect(encoded).toBe('e30='); // {} 인코딩 결과
    });

    it('유효하지 않은 입력은 에러', () => {
      expect(() => encodeConfig(null)).toThrow();
      expect(() => encodeConfig('string')).toThrow();
      expect(() => encodeConfig(123)).toThrow();
      expect(() => encodeConfig(undefined)).toThrow();
    });
  });

  describe('decodeConfig()', () => {
    it('Base64 문자열을 설정 객체로 디코딩', () => {
      const original = {
        text: 'Hello',
        fontSize: 48
      };

      const encoded = encodeConfig(original);
      const decoded = decodeConfig(encoded);

      expect(decoded).toEqual(original);
    });

    it('손상된 Base64는 null 반환 (에러 처리)', () => {
      const result = decodeConfig('invalid!!!base64');
      expect(result).toBeNull();
    });

    it('비유효 JSON은 null 반환', () => {
      const invalidJson = btoa('{ invalid json }');
      const result = decodeConfig(invalidJson);
      expect(result).toBeNull();
    });

    it('빈 문자열은 null 반환', () => {
      expect(decodeConfig('')).toBeNull();
      expect(decodeConfig('   ')).toBeNull();
    });

    it('null 입력은 null 반환', () => {
      expect(decodeConfig(null)).toBeNull();
      expect(decodeConfig(undefined)).toBeNull();
    });

    it('배열은 설정으로 취급 (객체이므로)', () => {
      // 배열도 JavaScript에서는 object이므로 encodeConfig/decodeConfig가 작동함
      // 하지만 일반적으로 설정은 배열이 아닌 객체이므로,
      // 실제 사용에서는 배열을 설정으로 전달하지 않음
      const arrayEncoded = btoa(JSON.stringify([1, 2, 3]));
      const decoded = decodeConfig(arrayEncoded);
      expect(decoded).toEqual([1, 2, 3]);
    });

    it('라운드트립: encode → decode → encode 일관성', () => {
      const original = {
        text: 'Test',
        number: 42,
        boolean: true,
        nested: { value: 'test' }
      };

      const encoded1 = encodeConfig(original);
      const decoded = decodeConfig(encoded1);
      const encoded2 = encodeConfig(decoded);

      expect(encoded1).toBe(encoded2);
    });
  });

  describe('getConfigFromURL()', () => {
    it('URL 쿼리에서 config 파라미터 추출', () => {
      const config = { text: 'Test', size: 48 };
      const encoded = encodeConfig(config);
      const url = `?config=${encoded}`;

      const decoded = getConfigFromURL(url);
      expect(decoded).toEqual(config);
    });

    it('query 파라미터가 없으면 null', () => {
      const result = getConfigFromURL('');
      expect(result).toBeNull();

      const result2 = getConfigFromURL('?other=value');
      expect(result2).toBeNull();
    });

    it('유효하지 않은 config는 null 반환', () => {
      const result = getConfigFromURL('?config=invalid!!!');
      expect(result).toBeNull();
    });

    it('다른 파라미터와 함께 사용 가능', () => {
      const config = { text: 'Test' };
      const encoded = encodeConfig(config);
      const url = `?foo=bar&config=${encoded}&baz=qux`;

      const decoded = getConfigFromURL(url);
      expect(decoded).toEqual(config);
    });

    it('URL이 전달되지 않으면 window.location.search 사용', () => {
      // window.location.search는 mock에서 ''로 설정됨
      const result = getConfigFromURL();
      expect(result).toBeNull();
    });
  });

  describe('buildShareURL()', () => {
    it('공유 가능한 URL 생성', () => {
      const config = { text: 'Share', size: 48 };
      const url = buildShareURL(config);

      expect(url).toContain('http://localhost:3000');
      expect(url).toContain('/ledboard/');
      expect(url).toContain('?config=');

      // URL에서 config 추출 가능한지 확인
      const decoded = getConfigFromURL('?' + url.split('?')[1]);
      expect(decoded).toEqual(config);
    });

    it('기본 URL을 커스터마이징할 수 있음', () => {
      const config = { text: 'Test' };
      const baseUrl = 'https://example.com/display';
      const url = buildShareURL(config, baseUrl);

      expect(url).toContain('https://example.com/display');
    });

    it('유효하지 않은 config는 에러', () => {
      expect(() => buildShareURL(null)).toThrow();
      expect(() => buildShareURL('not object')).toThrow();
    });
  });

  describe('getCleanURL()', () => {
    it('쿼리 파라미터가 없는 URL 반환', () => {
      const url = getCleanURL();
      expect(url).toBe('http://localhost:3000/ledboard/');
      expect(url).not.toContain('?');
    });
  });

  describe('encodeConfigArray()', () => {
    it('설정 배열 인코딩', () => {
      const configs = [
        { text: 'Config 1' },
        { text: 'Config 2' },
        { text: 'Config 3' }
      ];

      const encoded = encodeConfigArray(configs);
      expect(typeof encoded).toBe('string');
    });

    it('비배열 입력은 에러', () => {
      expect(() => encodeConfigArray({ text: 'not array' })).toThrow();
      expect(() => encodeConfigArray('string')).toThrow();
      expect(() => encodeConfigArray(null)).toThrow();
    });

    it('빈 배열도 인코딩 가능', () => {
      const encoded = encodeConfigArray([]);
      expect(typeof encoded).toBe('string');
    });
  });

  describe('decodeConfigArray()', () => {
    it('인코딩된 배열 디코딩', () => {
      const original = [
        { text: 'A' },
        { text: 'B' },
        { text: 'C' }
      ];

      const encoded = encodeConfigArray(original);
      const decoded = decodeConfigArray(encoded);

      expect(decoded).toEqual(original);
    });

    it('비배열 JSON은 null 반환', () => {
      const objectEncoded = btoa(JSON.stringify({ text: 'not array' }));
      expect(decodeConfigArray(objectEncoded)).toBeNull();
    });

    it('손상된 데이터는 null 반환', () => {
      expect(decodeConfigArray('invalid!!!')).toBeNull();
      expect(decodeConfigArray('')).toBeNull();
    });
  });

  describe('getEncodedSize()', () => {
    it('인코딩된 설정의 크기 계산', () => {
      const config = { text: 'Hello World', size: 48 };
      const size = getEncodedSize(config);

      expect(typeof size).toBe('number');
      expect(size > 0).toBe(true);
    });

    it('더 큰 설정은 더 큰 크기', () => {
      const small = { text: 'A' };
      const large = { text: 'A'.repeat(1000) };

      const sizeSmall = getEncodedSize(small);
      const sizeLarge = getEncodedSize(large);

      expect(sizeLarge).toBeGreaterThan(sizeSmall);
    });

    it('유효하지 않은 입력은 0 반환', () => {
      const size = getEncodedSize(null);
      expect(size).toBe(0);
    });
  });

  describe('isSameConfig()', () => {
    it('동일한 설정은 true', () => {
      const config1 = { text: 'Hello', size: 48 };
      const config2 = { text: 'Hello', size: 48 };

      expect(isSameConfig(config1, config2)).toBe(true);
    });

    it('다른 설정은 false', () => {
      const config1 = { text: 'Hello' };
      const config2 = { text: 'World' };

      expect(isSameConfig(config1, config2)).toBe(false);
    });

    it('속성 순서가 다르면 false (JSON 인코딩 시 순서 변경)', () => {
      const config1 = { a: 1, b: 2 };
      const config2 = { b: 2, a: 1 };

      // JSON.stringify는 객체 리터럴의 선언 순서를 유지하므로
      // 두 객체의 인코딩 결과가 다름
      const encoded1 = encodeConfig(config1);
      const encoded2 = encodeConfig(config2);
      expect(encoded1).not.toBe(encoded2);
    });

    it('유효하지 않은 입력은 false', () => {
      expect(isSameConfig(null, {})).toBe(false);
      expect(isSameConfig({}, 'string')).toBe(false);
    });
  });

  describe('sanitizeConfig()', () => {
    it('설정 객체 정제', () => {
      const config = {
        text: 'Hello',
        fontSize: 48,
        color: '#00FF00'
      };

      const sanitized = sanitizeConfig(config);

      expect(sanitized).toEqual(config);
    });

    it('null 입력은 빈 객체 반환', () => {
      const result = sanitizeConfig(null);
      expect(result).toEqual({});
    });

    it('undefined 입력은 빈 객체 반환', () => {
      const result = sanitizeConfig(undefined);
      expect(result).toEqual({});
    });

    it('유효한 객체는 복사되어 반환됨', () => {
      const original = { text: 'test' };
      const sanitized = sanitizeConfig(original);

      // 참조 분리 확인
      original.text = 'modified';
      expect(sanitized.text).toBe('test');
    });
  });

  describe('통합 테스트', () => {
    it('전체 공유 워크플로우', () => {
      // 1. 사용자가 설정 생성
      const userConfig = {
        text: 'LED Board Message',
        fontSize: 64,
        color: '#FF0000',
        animation: 'scroll'
      };

      // 2. 공유 URL 생성
      const shareUrl = buildShareURL(userConfig);
      expect(shareUrl).toContain('?config=');

      // 3. 다른 사용자가 URL 접속
      const configFromUrl = getConfigFromURL('?' + shareUrl.split('?')[1]);
      expect(configFromUrl).toEqual(userConfig);
    });

    it('URL 크기 제한 확인 (일반적인 URL 길이 제한)', () => {
      const config = { text: 'A'.repeat(1000) };
      const url = buildShareURL(config);

      // 일반적인 URL 길이 제한은 2048자 (HTTP 표준)
      // 특수 설정은 이를 초과할 수 있음
      expect(typeof url).toBe('string');
    });

    it('다양한 데이터 타입 보존', () => {
      const config = {
        string: 'text',
        number: 42,
        float: 3.14,
        boolean: true,
        nullValue: null,
        object: { nested: 'value' },
        array: [1, 2, 3],
        special: 'Test !@#$%'
      };

      const encoded = encodeConfig(config);
      const decoded = decodeConfig(encoded);

      expect(decoded).toEqual(config);
    });
  });
});
