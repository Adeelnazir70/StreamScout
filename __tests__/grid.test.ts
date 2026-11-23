import { getGridLayout } from '../src/components/ShowGrid';

describe('getGridLayout', () => {
  it('fits at least two columns on a small phone', () => {
    const { columns, cardWidth } = getGridLayout(320);
    expect(columns).toBe(2);
    expect(cardWidth).toBeGreaterThan(100);
  });

  it('adds columns on wider screens', () => {
    expect(getGridLayout(1024).columns).toBeGreaterThan(
      getGridLayout(400).columns,
    );
  });

  it('never makes cards wider than the screen allows', () => {
    for (const width of [360, 414, 768, 1280, 1920]) {
      const { columns, cardWidth } = getGridLayout(width);
      expect(columns * cardWidth).toBeLessThan(width);
    }
  });
});
