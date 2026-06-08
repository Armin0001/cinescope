export type MediaType = 'movie' | 'tv' | 'person';

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: Genre[];
  adult: boolean;
  original_language: string;
  video: boolean;
  runtime?: number;
  budget?: number;
  revenue?: number;
  status?: string;
  tagline?: string;
  homepage?: string;
  imdb_id?: string;
  production_companies?: ProductionCompany[];
  production_countries?: ProductionCountry[];
  spoken_languages?: SpokenLanguage[];
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  media_type?: MediaType;
}

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: Genre[];
  origin_country?: string[];
  original_language: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
  homepage?: string;
  episode_run_time?: number[];
  networks?: ProductionCompany[];
  production_companies?: ProductionCompany[];
  spoken_languages?: SpokenLanguage[];
  in_production?: boolean;
  type?: string;
  media_type?: MediaType;
}

export interface Person {
  id: number;
  name: string;
  also_known_as?: string[];
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  gender: number;
  homepage?: string | null;
  imdb_id?: string;
  known_for_department?: string;
  place_of_birth?: string | null;
  popularity: number;
  profile_path: string | null;
  known_for?: (Movie | TVShow)[];
  media_type?: MediaType;
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  official: boolean;
  published_at: string;
  site: string;
  size: number;
  type: string;
}

export interface Image {
  aspect_ratio: number;
  file_path: string;
  height: number;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface Review {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface Cast {
  id: number;
  name: string;
  original_name: string;
  character: string;
  credit_id: string;
  gender: number | null;
  known_for_department: string;
  order: number;
  popularity: number;
  profile_path: string | null;
  cast_id?: number;
}

export interface Crew {
  id: number;
  name: string;
  original_name: string;
  department: string;
  job: string;
  credit_id: string;
  gender: number | null;
  known_for_department: string;
  popularity: number;
  profile_path: string | null;
}

export interface CreditsResponse {
  id: number;
  cast: Cast[];
  crew: Crew[];
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviderResult {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface SearchResult {
  id: number;
  media_type: MediaType;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity: number;
  genre_ids?: number[];
  known_for?: (Movie | TVShow)[];
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface VideosResponse {
  id: number;
  results: Video[];
}

export interface ImagesResponse {
  id: number;
  backdrops: Image[];
  posters: Image[];
  logos?: Image[];
}

export interface ReviewsResponse {
  id: number;
  page: number;
  results: Review[];
  total_pages: number;
  total_results: number;
}

export interface WatchlistItem {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate: string;
  addedAt: string;
}

export interface Watchlist {
  wantToWatch: WatchlistItem[];
  watching: WatchlistItem[];
  completed: WatchlistItem[];
  favorites: WatchlistItem[];
}

export interface DiscoverParams {
  sort_by?: string;
  page?: number;
  with_genres?: string;
  primary_release_year?: number;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  'with_runtime.gte'?: number;
  'with_runtime.lte'?: number;
  with_original_language?: string;
  with_watch_providers?: string;
  watch_region?: string;
  'first_air_date_year'?: number;
  'air_date.gte'?: string;
  'air_date.lte'?: string;
}

export interface PersonMovieCredits {
  id: number;
  cast: (Movie & { character: string; credit_id: string })[];
  crew: (Movie & { department: string; job: string; credit_id: string })[];
}

export interface PersonTVCredits {
  id: number;
  cast: (TVShow & { character: string; credit_id: string; episode_count: number })[];
  crew: (TVShow & { department: string; job: string; credit_id: string })[];
}
