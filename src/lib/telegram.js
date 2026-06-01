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

export const tg = isTMA() ? window.Telegram.WebApp : getMockTg();

export const ready    = () => tg.ready();
export const expand   = () => tg.expand();
export const getInitData = () => tg.initData || '';
export const getUser     = () => tg.initDataUnsafe?.user || null;

export const showBackButton  = (cb) => { tg.BackButton.show(); tg.BackButton.onClick(cb); };
export const hideBackButton  = (cb) => { tg.BackButton.hide(); if (cb) tg.BackButton.offClick(cb); };

export const hapticLight   = () => tg.HapticFeedback.impactOccurred('light');
export const hapticMedium  = () => tg.HapticFeedback.impactOccurred('medium');
export const hapticSuccess = () => tg.HapticFeedback.notificationOccurred('success');
export const hapticError   = () => tg.HapticFeedback.notificationOccurred('error');
export const hapticWarning = () => tg.HapticFeedback.notificationOccurred('warning');

export const enableClosingConfirmation  = () => tg.enableClosingConfirmation();
export const disableClosingConfirmation = () => tg.disableClosingConfirmation();

export default tg;
