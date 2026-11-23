import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  fetchShowDetails,
  fetchTopRatedShows,
  searchShows,
} from '../api/tvmaze';

export const MIN_SEARCH_LENGTH = 2;

export function useTopRatedShows() {
  return useQuery({
    queryKey: ['shows', 'top-rated'],
    queryFn: ({ signal }) => fetchTopRatedShows(signal),
    staleTime: 60 * 60 * 1000, // the show index barely changes
  });
}

export function useSearchShows(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['shows', 'search', trimmed.toLowerCase()],
    queryFn: ({ signal }) => searchShows(trimmed, signal),
    enabled: trimmed.length >= MIN_SEARCH_LENGTH,
    // Keep the old results on screen while the next search loads,
    // so the grid doesn't flash empty on every keystroke.
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useShowDetails(id: number) {
  return useQuery({
    queryKey: ['shows', 'details', id],
    queryFn: ({ signal }) => fetchShowDetails(id, signal),
    staleTime: 30 * 60 * 1000,
  });
}
