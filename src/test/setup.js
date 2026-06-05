// src/test/setup.js
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Telegram WebApp
global.window.Telegram = {
  WebApp: {
    initData: 'query_id=AA...',
    initDataUnsafe: {
      user: { id: 123, first_name: 'Test', last_name: 'User', username: 'testuser' }
    },
    ready: vi.fn(),
    expand: vi.fn(),
    close: vi.fn(),
    MainButton: {
      setParams: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
    },
    HapticFeedback: {
      impactOccurred: vi.fn(),
      notificationOccurred: vi.fn(),
    }
  }
};
