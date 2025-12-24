/**
 * Animation Module Tests
 *
 * 애니메이션 상태 및 타이밍 관리 기능 검증
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isValidAnimationType,
  getSupportedAnimationTypes,
  calculateScrollDuration,
  normalizeScrollSpeed,
  getBlinkConfig,
  getPulseConfig,
  getScrollConfig,
  getAnimationConfig,
  requestAnimationFramePolyfill,
  cancelAnimationFramePolyfill,
  createAnimationState,
  startAnimation,
  pauseAnimation,
  resumeAnimation,
  resetAnimation,
  getAnimationProgress,
  isAnimationRunning,
  getAnimationStateDebugInfo
} from '../modules/animation.js';

describe('Animation Module', () => {
  describe('isValidAnimationType()', () => {
    it('유효한 애니메이션 타입 검증', () => {
      expect(isValidAnimationType('scroll')).toBe(true);
      expect(isValidAnimationType('blink')).toBe(true);
      expect(isValidAnimationType('pulse')).toBe(true);
      expect(isValidAnimationType('none')).toBe(true);
    });

    it('유효하지 않은 타입 거부', () => {
      expect(isValidAnimationType('invalid')).toBe(false);
      expect(isValidAnimationType('SCROLL')).toBe(false);
      expect(isValidAnimationType('')).toBe(false);
    });

    it('비문자열 입력 거부', () => {
      expect(isValidAnimationType(null)).toBe(false);
      expect(isValidAnimationType(undefined)).toBe(false);
      expect(isValidAnimationType(123)).toBe(false);
      expect(isValidAnimationType({})).toBe(false);
    });
  });

  describe('getSupportedAnimationTypes()', () => {
    it('지원 애니메이션 타입 목록 반환', () => {
      const types = getSupportedAnimationTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types).toContain('scroll');
      expect(types).toContain('blink');
      expect(types).toContain('pulse');
      expect(types).toContain('none');
      expect(types.length).toBe(4);
    });

    it('배열이 복사본 (원본 변경 방지)', () => {
      const types1 = getSupportedAnimationTypes();
      const types2 = getSupportedAnimationTypes();
      expect(types1).not.toBe(types2);
      expect(types1).toEqual(types2);
    });
  });

  describe('calculateScrollDuration()', () => {
    it('기본 지속시간 계산', () => {
      // 200px 텍스트, 200px/s 속도 = 1초
      // 하지만 최소값 2초로 제한
      const duration = calculateScrollDuration(200, 200);
      expect(duration).toBe(2); // Math.max(2, 1) = 2
    });

    it('느린 속도 (지속시간 길어짐)', () => {
      // 1000px, 50px/s = 20초
      const duration = calculateScrollDuration(1000, 50);
      expect(duration).toBe(20);
    });

    it('빠른 속도 (지속시간 짧아짐)', () => {
      // 100px, 1000px/s = 0.1초
      // 최소값 2초로 제한
      const duration = calculateScrollDuration(100, 1000);
      expect(duration).toBe(2);
    });

    it('최대값 제한 (120초)', () => {
      // 매우 긴 텍스트, 느린 속도
      const duration = calculateScrollDuration(10000, 40);
      expect(duration).toBeLessThanOrEqual(120);
    });

    it('유효하지 않은 입력은 기본값 반환', () => {
      expect(calculateScrollDuration(-100, 200)).toBe(2); // 기본값
      expect(calculateScrollDuration(0, 200)).toBe(2);
      expect(calculateScrollDuration(100, -50)).toBe(2);
      expect(calculateScrollDuration(100, 0)).toBe(2);
      expect(calculateScrollDuration('invalid', 200)).toBe(2);
      expect(calculateScrollDuration(100, 'invalid')).toBe(2);
    });
  });

  describe('normalizeScrollSpeed()', () => {
    it('유효한 속도 통과', () => {
      expect(normalizeScrollSpeed(120)).toBe(120);
      expect(normalizeScrollSpeed(50)).toBe(50);
      expect(normalizeScrollSpeed(250)).toBe(250);
    });

    it('최소값 제한 (40 px/s)', () => {
      expect(normalizeScrollSpeed(0)).toBe(40);
      expect(normalizeScrollSpeed(-100)).toBe(40);
      expect(normalizeScrollSpeed(30)).toBe(40);
    });

    it('최대값 제한 (300 px/s)', () => {
      expect(normalizeScrollSpeed(400)).toBe(300);
      expect(normalizeScrollSpeed(1000)).toBe(300);
    });

    it('반올림', () => {
      expect(normalizeScrollSpeed(120.4)).toBe(120);
      expect(normalizeScrollSpeed(120.5)).toBe(121);
      expect(normalizeScrollSpeed(120.9)).toBe(121);
    });

    it('유효하지 않은 입력은 기본값 반환', () => {
      expect(normalizeScrollSpeed('invalid')).toBe(120); // 기본값
      expect(normalizeScrollSpeed(null)).toBe(120);
      expect(normalizeScrollSpeed(undefined)).toBe(120);
      expect(normalizeScrollSpeed({})).toBe(120);
    });
  });

  describe('getBlinkConfig()', () => {
    it('Blink 설정 반환', () => {
      const config = getBlinkConfig();
      expect(config).toHaveProperty('period');
      expect(config).toHaveProperty('onDuration');
      expect(config).toHaveProperty('offDuration');
      expect(config.period).toBe(1000);
      expect(config.onDuration).toBe(500);
      expect(config.offDuration).toBe(500);
    });

    it('설정이 복사본 (원본 변경 방지)', () => {
      const config1 = getBlinkConfig();
      const config2 = getBlinkConfig();
      config1.period = 2000;
      expect(config2.period).toBe(1000);
    });
  });

  describe('getPulseConfig()', () => {
    it('Pulse 설정 반환', () => {
      const config = getPulseConfig();
      expect(config).toHaveProperty('period');
      expect(config).toHaveProperty('scaleMin');
      expect(config).toHaveProperty('scaleMax');
      expect(config.period).toBe(2000);
      expect(config.scaleMin).toBe(1);
      expect(config.scaleMax).toBe(1.1);
    });
  });

  describe('getScrollConfig()', () => {
    it('Scroll 설정 반환', () => {
      const config = getScrollConfig();
      expect(config).toHaveProperty('speedMin');
      expect(config).toHaveProperty('speedMax');
      expect(config).toHaveProperty('speedDefault');
      expect(config).toHaveProperty('durationMin');
      expect(config).toHaveProperty('durationMax');
    });
  });

  describe('getAnimationConfig()', () => {
    it('각 애니메이션 타입별 설정 반환', () => {
      expect(getAnimationConfig('scroll')).toHaveProperty('speedDefault');
      expect(getAnimationConfig('blink')).toHaveProperty('period');
      expect(getAnimationConfig('pulse')).toHaveProperty('scaleMax');
      expect(getAnimationConfig('none')).toEqual({ type: 'none' });
    });

    it('유효하지 않은 타입은 null 반환', () => {
      expect(getAnimationConfig('invalid')).toBeNull();
      expect(getAnimationConfig('')).toBeNull();
      expect(getAnimationConfig(null)).toBeNull();
    });
  });

  describe('requestAnimationFramePolyfill() & cancelAnimationFramePolyfill()', () => {
    it('요청 ID 반환', () => {
      const callback = vi.fn();
      const id = requestAnimationFramePolyfill(callback);
      expect(typeof id).toBe('number');
      expect(id > 0).toBe(true);
      cancelAnimationFramePolyfill(id);
    });

    it('콜백이 나중에 호출됨', (done) => {
      const callback = vi.fn();
      requestAnimationFramePolyfill(() => {
        callback();
        expect(callback).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('createAnimationState()', () => {
    it('기본 애니메이션 상태 생성', () => {
      const state = createAnimationState('scroll');
      expect(state.type).toBe('scroll');
      expect(state.isRunning).toBe(false);
      expect(state.startTime).toBeNull();
      expect(state.pausedTime).toBe(0);
    });

    it("유효하지 않은 타입은 'none' 사용", () => {
      const state = createAnimationState('invalid');
      expect(state.type).toBe('none');
    });

    it('null 입력도 처리', () => {
      const state = createAnimationState(null);
      expect(state.type).toBe('none');
    });
  });

  describe('startAnimation()', () => {
    it('애니메이션 시작', () => {
      const state = createAnimationState('scroll');
      const started = startAnimation(state);

      expect(started.isRunning).toBe(true);
      expect(started.startTime).toBeTruthy();
      expect(typeof started.startTime).toBe('number');
    });

    it('null 입력 처리', () => {
      const result = startAnimation(null);
      expect(result.type).toBe('none');
      expect(result.isRunning).toBe(true);
    });
  });

  describe('pauseAnimation()', () => {
    it('실행 중인 애니메이션 일시 중지', (done) => {
      const state = createAnimationState('scroll');
      const started = startAnimation(state);

      setTimeout(() => {
        const paused = pauseAnimation(started);
        expect(paused.isRunning).toBe(false);
        expect(paused.pausedTime > 0).toBe(true);
        done();
      }, 10);
    });

    it('이미 일시 중지된 애니메이션 무시', () => {
      const state = createAnimationState('scroll');
      const paused = pauseAnimation(state);
      expect(paused.isRunning).toBe(false);
    });

    it('null 입력 반환', () => {
      const result = pauseAnimation(null);
      expect(result).toBeNull();
    });
  });

  describe('resumeAnimation()', () => {
    it('일시 중지된 애니메이션 재개', () => {
      const state = createAnimationState('scroll');
      const started = startAnimation(state);
      const paused = pauseAnimation(started);
      const resumed = resumeAnimation(paused);

      expect(resumed.isRunning).toBe(true);
      expect(resumed.startTime).toBeTruthy();
    });

    it('null 입력 처리', () => {
      const result = resumeAnimation(null);
      expect(result.type).toBe('none');
      expect(result.isRunning).toBe(true);
    });
  });

  describe('resetAnimation()', () => {
    it('애니메이션 상태 초기화', () => {
      const state = createAnimationState('blink');
      const started = startAnimation(state);
      const reset = resetAnimation(started);

      expect(reset.type).toBe('blink');
      expect(reset.isRunning).toBe(false);
      expect(reset.startTime).toBeNull();
      expect(reset.pausedTime).toBe(0);
    });

    it('null 입력 처리', () => {
      const result = resetAnimation(null);
      expect(result.type).toBe('none');
      expect(result.isRunning).toBe(false);
    });
  });

  describe('getAnimationProgress()', () => {
    it('실행 중인 애니메이션의 진행도 계산', (done) => {
      const state = createAnimationState('scroll');
      const started = startAnimation(state);

      setTimeout(() => {
        const progress = getAnimationProgress(started, 1000); // 1초 지속시간
        expect(progress > 0).toBe(true);
        expect(progress <= 1).toBe(true);
        done();
      }, 50);
    });

    it('진행도는 0~1 범위로 제한', () => {
      const state = createAnimationState('scroll');
      const started = startAnimation(state);

      // 매우 긴 지속시간
      const progress = getAnimationProgress(started, 100000);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    it('미실행 애니메이션은 0 반환', () => {
      const state = createAnimationState('scroll');
      const progress = getAnimationProgress(state, 1000);
      expect(progress).toBe(0);
    });

    it('유효하지 않은 입력 처리', () => {
      expect(getAnimationProgress(null, 1000)).toBe(0);
      expect(getAnimationProgress({}, 1000)).toBe(0);
      expect(getAnimationProgress({ isRunning: true }, 'invalid')).toBe(0);
    });
  });

  describe('isAnimationRunning()', () => {
    it('실행 중인 애니메이션 감지', () => {
      const state = createAnimationState('scroll');
      const started = startAnimation(state);
      expect(isAnimationRunning(started)).toBe(true);
    });

    it('중지된 애니메이션 감지', () => {
      const state = createAnimationState('scroll');
      expect(isAnimationRunning(state)).toBe(false);
    });

    it('null 입력 처리', () => {
      expect(isAnimationRunning(null)).toBe(false);
      expect(isAnimationRunning(undefined)).toBe(false);
      expect(isAnimationRunning({})).toBe(false);
    });
  });

  describe('getAnimationStateDebugInfo()', () => {
    it('애니메이션 상태 정보 반환', () => {
      const state = createAnimationState('scroll');
      const info = getAnimationStateDebugInfo(state);
      expect(info).toContain('Animation');
      expect(info).toContain('scroll');
      expect(info).toContain('running=false');
    });

    it('실행 중인 애니메이션 정보', () => {
      const state = createAnimationState('blink');
      const started = startAnimation(state);
      const info = getAnimationStateDebugInfo(started);
      expect(info).toContain('blink');
      expect(info).toContain('running=true');
    });

    it('null 입력 처리', () => {
      const info = getAnimationStateDebugInfo(null);
      expect(info).toContain('Invalid');
    });
  });

  describe('통합 테스트', () => {
    it('완전한 애니메이션 라이프사이클', (done) => {
      // 1. 상태 생성
      const state = createAnimationState('scroll');
      expect(isAnimationRunning(state)).toBe(false);

      // 2. 애니메이션 시작
      const started = startAnimation(state);
      expect(isAnimationRunning(started)).toBe(true);

      // 3. 진행도 확인
      setTimeout(() => {
        const progress = getAnimationProgress(started, 1000);
        expect(progress > 0 && progress <= 1).toBe(true);

        // 4. 일시 중지
        const paused = pauseAnimation(started);
        expect(paused.isRunning).toBe(false);

        // 5. 재개
        const resumed = resumeAnimation(paused);
        expect(resumed.isRunning).toBe(true);

        // 6. 초기화
        const reset = resetAnimation(resumed);
        expect(reset.isRunning).toBe(false);

        done();
      }, 50);
    });

    it('스크롤 애니메이션 파라미터', () => {
      const config = getScrollConfig();
      const speed = normalizeScrollSpeed(150);
      const duration = calculateScrollDuration(500, speed);

      expect(speed).toBeGreaterThanOrEqual(config.speedMin);
      expect(speed).toBeLessThanOrEqual(config.speedMax);
      expect(duration).toBeGreaterThanOrEqual(config.durationMin);
      expect(duration).toBeLessThanOrEqual(config.durationMax);
    });

    it('여러 애니메이션 타입 상태 관리', () => {
      const animations = {
        scroll: createAnimationState('scroll'),
        blink: createAnimationState('blink'),
        pulse: createAnimationState('pulse'),
        none: createAnimationState('none')
      };

      // 각 애니메이션 시작
      Object.keys(animations).forEach(key => {
        animations[key] = startAnimation(animations[key]);
      });

      // 모두 실행 중인지 확인
      Object.values(animations).forEach(anim => {
        expect(isAnimationRunning(anim)).toBe(true);
      });

      // 모두 일시 중지
      Object.keys(animations).forEach(key => {
        animations[key] = pauseAnimation(animations[key]);
      });

      // 모두 중지되었는지 확인
      Object.values(animations).forEach(anim => {
        expect(isAnimationRunning(anim)).toBe(false);
      });
    });
  });
});
