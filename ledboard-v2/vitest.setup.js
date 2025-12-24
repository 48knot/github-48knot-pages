/**
 * Vitest Setup File
 * 테스트 환경 초기화
 */

// localStorage polyfill (jsdom이 제대로 작동하지 않을 때)
if (!window.localStorage) {
  const store = {};

  window.localStorage = {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    },
    key(index) {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    }
  };
}

// Object.keys를 localStorage에서도 사용 가능하게 설정
if (window.localStorage && !('keys' in localStorage)) {
  Object.defineProperty(localStorage, 'keys', {
    value() {
      return Object.keys(this);
    }
  });
}
