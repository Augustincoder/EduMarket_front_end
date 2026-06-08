// src/hooks/useMainButton.js
import { useEffect } from 'react';
import getTg from '../lib/telegram';

/**
 * Custom hook to control the Telegram WebApp MainButton.
 * @param {string} text - Button text. If empty, the button is hidden.
 * @param {function} onClick - Callback for button click.
 * @param {boolean} disabled - Whether the button is disabled.
 * @param {boolean} isLoading - Whether the button should show a progress indicator.
 * @param {string} color - Button background color (optional).
 * @param {string} textColor - Button text color (optional).
 * @param {any[]} deps - Dependency array for the effect.
 */
export function useMainButton({
  text,
  onClick,
  disabled = false,
  isLoading = false,
  color = '#1D9E75', // var(--edu-primary) default
  textColor = '#FFFFFF',
}, deps = []) {
  useEffect(() => {
    const tg = getTg();
    const mb = tg.MainButton;

    if (!text) {
      mb.hide();
      return;
    }

    mb.setParams({
      text: text.toUpperCase(),
      color,
      text_color: textColor,
      is_active: !disabled && !isLoading,
      is_visible: true,
    });

    if (isLoading) {
      mb.showProgress();
    } else {
      mb.hideProgress();
    }

    const handler = () => {
      if (!disabled && !isLoading && onClick) {
        onClick();
      }
    };

    mb.onClick(handler);
    mb.show();

    return () => {
      mb.offClick(handler);
      mb.hide();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, onClick, disabled, isLoading, color, textColor, ...deps]);
}

export default useMainButton;
