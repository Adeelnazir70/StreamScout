/** 75 -> "1:15", 3725 -> "1:02:05". Anything invalid shows as "0:00". */
export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '0:00';
  }
  const whole = Math.floor(totalSeconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

/**
 * Keeps a seek target inside the video. Before the duration is known
 * (it's 0 until the stream loads) we only stop it going below zero.
 */
export function clampTime(time: number, duration: number): number {
  const atLeastZero = Math.max(0, time);
  return duration > 0 ? Math.min(atLeastZero, duration) : atLeastZero;
}

/** Fraction from 0 to 1 for progress bars, safe when duration is 0. */
export function toProgress(time: number, duration: number): number {
  if (duration <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, time / duration));
}
