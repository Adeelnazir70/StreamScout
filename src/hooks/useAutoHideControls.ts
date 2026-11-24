import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Player controls that fade away while the video plays, like most video apps.
 * `autoHide` is false while paused or showing an error, so the controls stay up.
 */
export function useAutoHideControls(autoHide: boolean, delayMs = 3500) {
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const show = useCallback(() => {
    setVisible(true);
    clearTimer();
    if (autoHide) {
      timer.current = setTimeout(() => setVisible(false), delayMs);
    }
  }, [autoHide, delayMs, clearTimer]);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  // Restart the countdown whenever playback starts or stops.
  useEffect(() => {
    show();
    return clearTimer;
  }, [show, clearTimer]);

  return { visible, show, hide };
}
