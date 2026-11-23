import type { SearchResult, Show, ShowDetails } from './types';

const BASE_URL = 'https://api.tvmaze.com';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.status === 429
        ? 'Too many requests. Give it a few seconds and try again.'
        : `Request failed (${response.status})`,
    );
  }
  return (await response.json()) as T;
}

/**
 * TVMaze has no "popular" endpoint, so we take the first page of the
 * show index (which holds most of the well-known older shows) and sort it
 * by rating. Shows without a poster are skipped because they look broken
 * in a grid.
 */
export function pickTopRated(shows: Show[], limit: number): Show[] {
  return shows
    .filter(show => show.image !== null && show.rating.average !== null)
    .sort((a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0))
    .slice(0, limit);
}

export async function fetchTopRatedShows(signal?: AbortSignal) {
  const shows = await get<Show[]>('/shows?page=0', signal);
  return pickTopRated(shows, 60);
}

export async function searchShows(query: string, signal?: AbortSignal) {
  const results = await get<SearchResult[]>(
    `/search/shows?q=${encodeURIComponent(query.trim())}`,
    signal,
  );
  return results.map(result => result.show);
}

export function fetchShowDetails(id: number, signal?: AbortSignal) {
  return get<ShowDetails>(`/shows/${id}?embed=cast`, signal);
}
