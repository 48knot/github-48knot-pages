/**
 * Validator Module Tests
 *
 * 입력 데이터 검증 및 정규화 기능 검증
 */

import { describe, it, expect } from 'vitest';
import {
  validateText,
  validateFontSize,
  validateLetterSpacing,
  validateColor,
  rgbToHex,
  hexToRgb,
  validateAnimation,
  validateFontFamily,
  validateSpeed,
  validateStartOffset,
  validateBoolean,
  validateConfig,
  getDefaultConfig,
  isConfigEqual,
  mergeConfig,
  getValidationErrors
} from '../modules/validator.js';

describe('Validator Module', () => {
  describe('validateText()', () => {
    it('문자열 텍스트 정규화', () => {
      expect(validateText('  Hello  ')).toBe('Hello');
      expect(validateText('World')).toBe('World');
    });

    it('빈 문자열 처리', () => {
      expect(validateText('')).toBe('');
      expect(validateText('   ')).toBe('');
    });

    it('비문자열 입력은 빈 문자열 반환', () => {
      expect(validateText(null)).toBe('');
      expect(validateText(undefined)).toBe('');
      expect(validateText(123)).toBe('');
    });

    it('특수 문자 및 이모지 보존', () => {
      expect(validateText('Hello !@#$%')).toBe('Hello !@#$%');
      expect(validateText('테스트')).toBe('테스트');
    });
  });

  describe('validateFontSize()', () => {
    it('유효한 글자 크기 범위 (20~240)', () => {
      expect(validateFontSize(48)).toBe(48);
      expect(validateFontSize(80)).toBe(80);
      expect(validateFontSize(200)).toBe(200);
    });

    it('범위 이하는 최소값으로 조정', () => {
      expect(validateFontSize(10)).toBe(20);
      expect(validateFontSize(0)).toBe(20);
      expect(validateFontSize(-50)).toBe(20);
    });

    it('범위 초과는 최대값으로 조정', () => {
      expect(validateFontSize(300)).toBe(240);
      expect(validateFontSize(999)).toBe(240);
    });

    it('소수는 반올림', () => {
      expect(validateFontSize(48.4)).toBe(48);
      expect(validateFontSize(48.5)).toBe(49);
      expect(validateFontSize(48.9)).toBe(49);
    });

    it('비숫자 입력은 기본값 반환', () => {
      expect(validateFontSize('48')).toBe(48);
      expect(validateFontSize(null)).toBe(80);
      expect(validateFontSize('invalid')).toBe(80);
    });
  });

  describe('validateLetterSpacing()', () => {
    it('유효한 자간 범위 (0~40)', () => {
      expect(validateLetterSpacing(0)).toBe(0);
      expect(validateLetterSpacing(10)).toBe(10);
      expect(validateLetterSpacing(40)).toBe(40);
    });

    it('범위 조정', () => {
      expect(validateLetterSpacing(-5)).toBe(0);
      expect(validateLetterSpacing(50)).toBe(40);
    });

    it('기본값은 0', () => {
      expect(validateLetterSpacing(null)).toBe(0);
      expect(validateLetterSpacing('invalid')).toBe(0);
    });
  });

  describe('validateColor()', () => {
    it('유효한 HEX 색상 검증', () => {
      expect(validateColor('#FF0000')).toBe('#FF0000');
      expect(validateColor('#00ff00')).toBe('#00FF00');
      expect(validateColor('#0a84ff')).toBe('#0A84FF');
    });

    it('유효하지 않은 색상은 기본값 반환', () => {
      // 기본값은 #000000 (검은색)
      const defaultColor = '#000000';
      expect(validateColor('not-a-color')).toBe(defaultColor);
      expect(validateColor('#GGGGGG')).toBe(defaultColor);
      expect(validateColor('FF0000')).toBe(defaultColor);
    });

    it('커스텀 기본값 지정 가능', () => {
      expect(validateColor('invalid', '#FF00FF')).toBe('#FF00FF');
    });

    it('소문자를 대문자로 변환', () => {
      expect(validateColor('#abc123')).toBe('#ABC123');
    });

    it('null/undefined는 기본값', () => {
      expect(validateColor(null)).toBe('#000000');
      expect(validateColor(undefined)).toBe('#000000');
    });
  });

  describe('rgbToHex() & hexToRgb()', () => {
    it('RGB to HEX 변환', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00FF00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000FF');
      expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
    });

    it('HEX to RGB 변환', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('라운드트립: RGB -> HEX -> RGB', () => {
      const original = { r: 100, g: 150, b: 200 };
      const hex = rgbToHex(original.r, original.g, original.b);
      const rgb = hexToRgb(hex);

      expect(rgb).toEqual(original);
    });

    it('유효하지 않은 HEX는 null 반환', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#GGGGGG')).toBeNull();
    });
  });

  describe('validateAnimation()', () => {
    it('유효한 애니메이션 모드', () => {
      expect(validateAnimation('scroll')).toBe('scroll');
      expect(validateAnimation('blink')).toBe('blink');
      expect(validateAnimation('pulse')).toBe('pulse');
      expect(validateAnimation('none')).toBe('none');
    });

    it('유효하지 않은 모드는 기본값 반환', () => {
      expect(validateAnimation('invalid')).toBe('scroll');
      expect(validateAnimation('SCROLL')).toBe('scroll');
      expect(validateAnimation(null)).toBe('scroll');
    });
  });

  describe('validateFontFamily()', () => {
    it('유효한 폰트 패밀리', () => {
      expect(validateFontFamily('monospace')).toBe('monospace');
      expect(validateFontFamily('system')).toBe('system');
      expect(validateFontFamily('rounded')).toBe('rounded');
      expect(validateFontFamily('seven')).toBe('seven');
    });

    it('유효하지 않은 폰트는 기본값 반환', () => {
      expect(validateFontFamily('serif')).toBe('monospace');
      expect(validateFontFamily('MONOSPACE')).toBe('monospace');
      expect(validateFontFamily(null)).toBe('monospace');
    });
  });

  describe('validateSpeed()', () => {
    it('유효한 속도 범위 (40~300 px/s)', () => {
      expect(validateSpeed(40)).toBe(40);
      expect(validateSpeed(120)).toBe(120);
      expect(validateSpeed(300)).toBe(300);
    });

    it('범위 조정', () => {
      expect(validateSpeed(10)).toBe(40);
      expect(validateSpeed(500)).toBe(300);
    });

    it('기본값은 120', () => {
      expect(validateSpeed(null)).toBe(120);
      expect(validateSpeed('invalid')).toBe(120);
    });
  });

  describe('validateStartOffset()', () => {
    it('유효한 오프셋 범위 (0~100 vw)', () => {
      expect(validateStartOffset(0)).toBe(0);
      expect(validateStartOffset(50)).toBe(50);
      expect(validateStartOffset(100)).toBe(100);
    });

    it('범위 조정', () => {
      expect(validateStartOffset(-10)).toBe(0);
      expect(validateStartOffset(150)).toBe(100);
    });

    it('기본값은 10', () => {
      // null/undefined는 명시적으로 기본값 반환
      expect(validateStartOffset(null)).toBe(10);
      expect(validateStartOffset(undefined)).toBe(10);
      // 문자열은 NaN이므로 기본값 반환
      expect(validateStartOffset('invalid')).toBe(10);
    });
  });

  describe('validateBoolean()', () => {
    it('truthy 값은 true', () => {
      expect(validateBoolean(true)).toBe(true);
      expect(validateBoolean(1)).toBe(true);
      expect(validateBoolean('text')).toBe(true);
    });

    it('falsy 값은 false', () => {
      expect(validateBoolean(false)).toBe(false);
      expect(validateBoolean(0)).toBe(false);
      expect(validateBoolean('')).toBe(false);
      expect(validateBoolean(null)).toBe(false);
      expect(validateBoolean(undefined)).toBe(false);
    });
  });

  describe('validateConfig()', () => {
    it('전체 설정 검증 및 정규화', () => {
      const config = {
        text: '  Hello  ',
        fontSize: 48,
        letterSpacing: 10,
        textColor: '#ff0000',
        backgroundColor: '#000000',
        animation: 'blink',
        fontFamily: 'system',
        neon: true,
        speed: 150,
        startOffset: 25,
        forcePortrait: true
      };

      const validated = validateConfig(config);

      expect(validated.text).toBe('Hello');
      expect(validated.fontSize).toBe(48);
      expect(validated.letterSpacing).toBe(10);
      expect(validated.textColor).toBe('#FF0000');
      expect(validated.animation).toBe('blink');
      expect(validated.fontFamily).toBe('system');
      expect(validated.neon).toBe(true);
      expect(validated.speed).toBe(150);
      expect(validated.startOffset).toBe(25);
      expect(validated.forcePortrait).toBe(true);
    });

    it('부분 설정도 검증 가능 (기본값 적용)', () => {
      const config = { fontSize: 100 };
      const validated = validateConfig(config);

      expect(validated.fontSize).toBe(100);
      expect(validated.text).toBe('');
      expect(validated.animation).toBe('scroll');
    });

    it('유효하지 않은 입력은 기본값', () => {
      const validated = validateConfig(null);
      expect(validated).toEqual(getDefaultConfig());
    });

    it('범위 초과 값은 조정됨', () => {
      const config = {
        fontSize: 500,
        speed: 1000,
        startOffset: 200
      };

      const validated = validateConfig(config);

      expect(validated.fontSize).toBe(240);
      expect(validated.speed).toBe(300);
      expect(validated.startOffset).toBe(100);
    });
  });

  describe('getDefaultConfig()', () => {
    it('기본 설정 반환', () => {
      const defaultConfig = getDefaultConfig();

      expect(defaultConfig).toEqual({
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
      });
    });
  });

  describe('isConfigEqual()', () => {
    it('동일한 설정 비교', () => {
      const config1 = { text: 'Hello', fontSize: 48 };
      const config2 = { text: 'Hello', fontSize: 48 };

      expect(isConfigEqual(config1, config2)).toBe(true);
    });

    it('다른 설정 비교', () => {
      const config1 = { text: 'Hello', fontSize: 48 };
      const config2 = { text: 'World', fontSize: 48 };

      expect(isConfigEqual(config1, config2)).toBe(false);
    });

    it('깊은 비교 수행', () => {
      const config1 = { nested: { value: 'test' } };
      const config2 = { nested: { value: 'test' } };

      expect(isConfigEqual(config1, config2)).toBe(true);
    });
  });

  describe('mergeConfig()', () => {
    it('부분 설정을 기본값과 병합', () => {
      const partial = { fontSize: 100, text: 'Test' };
      const merged = mergeConfig(partial);

      expect(merged.fontSize).toBe(100);
      expect(merged.text).toBe('Test');
      expect(merged.animation).toBe('scroll'); // 기본값
    });

    it('부분 설정만 병합 (validateConfig 적용)', () => {
      // mergeConfig는 validateConfig를 통해 전체 필드를 검증하고 기본값을 적용함
      const partial = { fontSize: 100 };

      const merged = mergeConfig(partial);

      // validateConfig가 호출되므로 모든 필드가 채워짐
      expect(merged.fontSize).toBe(100);
      expect(merged.animation).toBe('scroll'); // validateConfig 기본값
      expect(merged.neon).toBe(false); // validateConfig 기본값
    });

    it('유효하지 않은 입력은 기본값 반환', () => {
      const merged = mergeConfig(null);
      expect(merged).toEqual(getDefaultConfig());
    });
  });

  describe('getValidationErrors()', () => {
    it('유효한 설정은 에러 없음', () => {
      const config = getDefaultConfig();
      const errors = getValidationErrors(config);

      expect(errors).toEqual([]);
    });

    it('범위 초과 필드 감지', () => {
      const config = {
        fontSize: 1000,
        letterSpacing: -10,
        speed: 5000,
        startOffset: 200
      };

      const errors = getValidationErrors(config);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('fontSize'))).toBe(true);
      expect(errors.some(e => e.includes('speed'))).toBe(true);
    });

    it('유효하지 않은 색상 감지', () => {
      const config = {
        textColor: 'not-a-color',
        backgroundColor: '#GGGGGG'
      };

      const errors = getValidationErrors(config);

      expect(errors.some(e => e.includes('textColor'))).toBe(true);
      expect(errors.some(e => e.includes('backgroundColor'))).toBe(true);
    });

    it('유효하지 않은 열거형 감지', () => {
      const config = {
        animation: 'invalid-animation',
        fontFamily: 'serif'
      };

      const errors = getValidationErrors(config);

      expect(errors.some(e => e.includes('animation'))).toBe(true);
      expect(errors.some(e => e.includes('fontFamily'))).toBe(true);
    });

    it('null 입력은 에러 메시지 반환', () => {
      const errors = getValidationErrors(null);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('설정 객체');
    });
  });

  describe('통합 테스트', () => {
    it('전체 검증 워크플로우', () => {
      // 1. 사용자 입력 (유효하지 않은 데이터)
      const userInput = {
        text: '  LED Display  ',
        fontSize: '500', // 문자열
        letterSpacing: -5, // 범위 초과
        textColor: 'red', // 유효하지 않은 색상
        animation: 'SCROLL', // 대문자
        speed: '1000' // 문자열, 범위 초과
      };

      // 2. 검증
      const validated = validateConfig(userInput);
      const errors = getValidationErrors(validated);

      // 3. 결과 확인
      expect(validated.text).toBe('LED Display');
      expect(validated.fontSize).toBe(240); // 최대값으로 조정
      expect(validated.letterSpacing).toBe(0); // 최소값으로 조정
      expect(validated.textColor).toBe('#00FF00'); // validateConfig의 기본값은 #00FF00
      expect(validated.animation).toBe('scroll'); // 소문자로 정규화
      expect(validated.speed).toBe(300); // 최대값으로 조정
      expect(errors).toEqual([]); // 정규화 후 에러 없음
    });

    it('색상 변환 통합 테스트', () => {
      // RGB 입력을 받아서 HEX로 변환 후 저장
      const rgb = { r: 255, g: 0, b: 0 };
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      const validated = validateColor(hex);

      expect(validated).toBe('#FF0000');

      // 다시 RGB로 변환
      const restored = hexToRgb(validated);
      expect(restored).toEqual(rgb);
    });
  });
});
