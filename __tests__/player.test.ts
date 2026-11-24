import { pickSampleStream, SAMPLE_STREAMS } from '../src/api/streams';
import { clampTime, formatTime, toProgress } from '../src/utils/time';

describe('formatTime', () => {
  it('formats minutes and seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(75)).toBe('1:15');
    expect(formatTime(596.4)).toBe('9:56');
  });

  it('adds hours for long videos', () => {
    expect(formatTime(3725)).toBe('1:02:05');
  });

  it('handles values the player can send before loading', () => {
    expect(formatTime(NaN)).toBe('0:00');
    expect(formatTime(-3)).toBe('0:00');
    expect(formatTime(Infinity)).toBe('0:00');
  });
});

describe('clampTime', () => {
  it('keeps seeks inside the video', () => {
    expect(clampTime(-5, 100)).toBe(0);
    expect(clampTime(50, 100)).toBe(50);
    expect(clampTime(105, 100)).toBe(100);
  });

  it('only stops negative values before the duration is known', () => {
    expect(clampTime(30, 0)).toBe(30);
    expect(clampTime(-10, 0)).toBe(0);
  });
});

describe('toProgress', () => {
  it('returns a 0 to 1 fraction', () => {
    expect(toProgress(25, 100)).toBe(0.25);
    expect(toProgress(150, 100)).toBe(1);
    expect(toProgress(10, 0)).toBe(0);
  });
});

describe('pickSampleStream', () => {
  it('always gives the same show the same stream', () => {
    expect(pickSampleStream(169)).toBe(pickSampleStream(169));
  });

  it('spreads shows across all streams', () => {
    const picked = new Set(
      [1, 2, 3, 4, 5, 6].map(id => pickSampleStream(id).id),
    );
    expect(picked.size).toBe(SAMPLE_STREAMS.length);
  });

  it('only uses HLS streams over https', () => {
    for (const stream of SAMPLE_STREAMS) {
      expect(stream.uri).toMatch(/^https:\/\/.+\.m3u8$/);
    }
  });
});
