import { ApiError, pickTopRated, searchShows } from '../src/api/tvmaze';
import type { Show } from '../src/api/types';

const makeShow = (
  id: number,
  rating: number | null,
  hasImage = true,
): Show => ({
  id,
  name: `Show ${id}`,
  genres: [],
  status: 'Ended',
  premiered: '2010-01-01',
  ended: null,
  runtime: 60,
  rating: { average: rating },
  image: hasImage ? { medium: 'm.jpg', original: 'o.jpg' } : null,
  summary: null,
  network: null,
  webChannel: null,
});

describe('pickTopRated', () => {
  it('sorts by rating and limits the result', () => {
    const shows = [makeShow(1, 7), makeShow(2, 9.2), makeShow(3, 8.1)];
    expect(pickTopRated(shows, 2).map(s => s.id)).toEqual([2, 3]);
  });

  it('skips shows without a poster or rating', () => {
    const shows = [makeShow(1, 9, false), makeShow(2, null), makeShow(3, 6)];
    expect(pickTopRated(shows, 10).map(s => s.id)).toEqual([3]);
  });

  it('does not mutate the input array', () => {
    const shows = [makeShow(1, 7), makeShow(2, 9)];
    pickTopRated(shows, 10);
    expect(shows.map(s => s.id)).toEqual([1, 2]);
  });
});

describe('searchShows', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('encodes the query and unwraps results', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ score: 1, show: makeShow(5, 8) }],
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const shows = await searchShows('  the office & co ');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.tvmaze.com/search/shows?q=the%20office%20%26%20co',
    );
    expect(shows.map(s => s.id)).toEqual([5]);
  });

  it('throws a friendly error when rate limited', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 429 }) as unknown as typeof fetch;

    await expect(searchShows('lost')).rejects.toEqual(
      expect.objectContaining({ name: 'ApiError', status: 429 }),
    );
    await expect(searchShows('lost')).rejects.toBeInstanceOf(ApiError);
  });
});
