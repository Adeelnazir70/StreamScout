import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ShowSummary } from '../api/types';

interface FavoritesState {
  /** Newest first. We store a small snapshot so the list works offline. */
  favorites: ShowSummary[];
  toggleFavorite: (show: ShowSummary) => void;
}

export function toSummary(show: ShowSummary): ShowSummary {
  const { id, name, image, rating, premiered, ended, status } = show;
  return { id, name, image, rating, premiered, ended, status };
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    set => ({
      favorites: [],
      toggleFavorite: show =>
        set(state => {
          const exists = state.favorites.some(f => f.id === show.id);
          return {
            favorites: exists
              ? state.favorites.filter(f => f.id !== show.id)
              : [toSummary(show), ...state.favorites],
          };
        }),
    }),
    {
      name: 'favorites',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ favorites: state.favorites }),
    },
  ),
);

export const useIsFavorite = (id: number) =>
  useFavoritesStore(state => state.favorites.some(f => f.id === id));
