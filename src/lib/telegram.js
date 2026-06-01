// src/lib/telegram.js
// Telegram WebApp SDK helpers + browser mock fallback

const isTMA = () =>
  typeof window !== 'undefined' &&
  window.Telegram &&
  window.Telegram.WebApp &&
  window.Telegram.WebApp.initData !== '';

const getMockTg = () => ({
  ready: () => {},
  expand: () => {},
  close: () => {},
  enableClosingConfirmation: () => {},
  disableClosingConfirmation: () => {},
  colorScheme: 'light',
  themeParams: { bg_color: '#F8F7F4', text_color: '#1A1916' },
  initData: 'mock_init_data',
  initDataUnsafe: {
    user: {
      id: 99999999,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      photo_url: null,
    },
    hash: 'mock_hash',
  },
  BackButton: {
    show: () => {},
    hide: () => {},
    onClick: () => {},
    offClick: () => {},
    isVisible: false,
  },
  MainButton: {
    show: () => {},
    hide: () => {},
    setText: () => {},
    onClick: () => {},
    offClick: () => {},
    showProgress: () => {},
    hideProgress: () => {},
    setParams: () => {},
    isVisible: false,
    text: '',
    color: '#1D9E75',
  },
  HapticFeedback: {
    impactOccurred: () => {},
    notificationOccurred: () => {},
    selectionChanged: () => {},
  },
  isExpanded: true,
  viewportHeight: window.innerHeight,
  viewportStableHeight: window.innerHeight,
});

export const getTg = () => isTMA() ? window.Telegram.WebApp : getMockTg();

export const ready    = () => getTg().ready();
export const expand   = () => getTg().expand();
export const getInitData = () => {
  if (isTMA()) return window.Telegram.WebApp.initData;
  return getMockTg().initData;
};
export const getUser     = () => {
  if (isTMA()) return window.Telegram.WebApp.initDataUnsafe?.user || null;
  return getMockTg().initDataUnsafe?.user || null;
};

export const getStartParam = () => {
  if (isTMA()) {
    return window.Telegram.WebApp.initDataUnsafe?.start_param || null;
  }
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('tgWebAppStartParam') || urlParams.get('start') || null;
};

export const showBackButton  = (cb) => { getTg().BackButton.show(); getTg().BackButton.onClick(cb); };
export const hideBackButton  = (cb) => { getTg().BackButton.hide(); if (cb) getTg().BackButton.offClick(cb); };

export const hapticLight   = () => getTg().HapticFeedback.impactOccurred('light');
export const hapticMedium  = () => getTg().HapticFeedback.impactOccurred('medium');
export const hapticSuccess = () => getTg().HapticFeedback.notificationOccurred('success');
export const hapticError   = () => getTg().HapticFeedback.notificationOccurred('error');
export const hapticWarning = () => getTg().HapticFeedback.notificationOccurred('warning');

export const enableClosingConfirmation  = () => getTg().enableClosingConfirmation();
export const disableClosingConfirmation = () => getTg().disableClosingConfirmation();

export default getTg;
