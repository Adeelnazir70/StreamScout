// Only the fields the app uses. Full schema: https://www.tvmaze.com/api

export interface ImageSet {
  medium: string;
  original: string;
}

export interface Show {
  id: number;
  name: string;
  genres: string[];
  status: string;
  premiered: string | null;
  ended: string | null;
  runtime: number | null;
  rating: { average: number | null };
  image: ImageSet | null;
  summary: string | null;
  network: { name: string } | null;
  webChannel: { name: string } | null;
}

export interface CastMember {
  person: { id: number; name: string; image: ImageSet | null };
  character: { id: number; name: string };
}

export interface ShowDetails extends Show {
  _embedded?: { cast: CastMember[] };
}

export interface SearchResult {
  score: number;
  show: Show;
}

/** The subset of a show we keep for list cards and saved favourites. */
export type ShowSummary = Pick<
  Show,
  'id' | 'name' | 'image' | 'rating' | 'premiered' | 'ended' | 'status'
>;
