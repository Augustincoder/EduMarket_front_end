// src/hooks/useTelegram.js
import getTg from '../lib/telegram';

export function useTelegram() {
  const tg = getTg();
  return tg;
}
