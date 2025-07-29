// vitest.setup.ts
// This file can be used for global test setup, mocks, or configurations.
// For example, if you need to mock global objects like localStorage or fetch, you can do it here.

import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (function () {
  let store: { [key: string]: string } = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true, // Make it writable so we can re-assign it if needed, though not strictly necessary for this mock
});

// Mock fetch API
window.fetch = vi.fn();
