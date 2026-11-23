import type { Show } from '../src/api/types';
import { useFavoritesStore } from '../src/store/favorites';

const show = (id: number): Show => ({
  id,
  name: `Show ${id}`,
  genres: ['Drama'],
  status: 'Ended',
  premiered: '2010-01-01',
  ended: '2012-01-01',
  runtime: 45,
  rating: { average: 8 },
  image: null,
  summary: '<p>Long summary we do not want to store</p>',
  network: { name: 'HBO' },
  webChannel: null,
});

beforeEach(() => {
  useFavoritesStore.setState({ favorites: [] });
});

describe('favourites store', () => {
  it('adds newest first and removes on second toggle', () => {
    const { toggleFavorite } = useFavoritesStore.getState();

    toggleFavorite(show(1));
    toggleFavorite(show(2));
    expect(useFavoritesStore.getState().favorites.map(f => f.id)).toEqual([
      2, 1,
    ]);

    toggleFavorite(show(1));
    expect(useFavoritesStore.getState().favorites.map(f => f.id)).toEqual([2]);
  });

  it('stores only the summary fields, not the full show', () => {
    useFavoritesStore.getState().toggleFavorite(show(3));
    const saved = useFavoritesStore.getState().favorites[0];

    expect(saved).not.toHaveProperty('summary');
    expect(saved).not.toHaveProperty('network');
    expect(saved).toMatchObject({ id: 3, name: 'Show 3' });
  });
});
