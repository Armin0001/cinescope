import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Movie, TVShow, Person, CreditsResponse, VideosResponse,
  ImagesResponse, ReviewsResponse, WatchProviderResult,
  SearchResult, PaginatedResponse, DiscoverParams,
  Genre, PersonMovieCredits, PersonTVCredits
} from '../models/tmdb.models';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private http = inject(HttpClient);
  private baseUrl = environment.tmdbBaseUrl;
  private apiKey = environment.tmdbApiKey;

  private buildParams(extra: Record<string, string | number | boolean> = {}): HttpParams {
    let params = new HttpParams().set('api_key', this.apiKey);
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return params;
  }

  // Trending
  getTrending(mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'day'): Observable<PaginatedResponse<Movie | TVShow | SearchResult>> {
    return this.http.get<PaginatedResponse<Movie | TVShow | SearchResult>>(
      `${this.baseUrl}/trending/${mediaType}/${timeWindow}`,
      { params: this.buildParams() }
    );
  }

  // Movies
  getPopularMovies(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${this.baseUrl}/movie/popular`,
      { params: this.buildParams({ page }) }
    );
  }

  getNowPlaying(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${this.baseUrl}/movie/now_playing`,
      { params: this.buildParams({ page }) }
    );
  }

  getUpcoming(page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${this.baseUrl}/movie/upcoming`,
      { params: this.buildParams({ page }) }
    );
  }

  getTopRated(mediaType: 'movie' | 'tv' = 'movie', page = 1): Observable<PaginatedResponse<Movie | TVShow>> {
    return this.http.get<PaginatedResponse<Movie | TVShow>>(
      `${this.baseUrl}/${mediaType}/top_rated`,
      { params: this.buildParams({ page }) }
    );
  }

  getMovieDetails(id: number): Observable<Movie> {
    return this.http.get<Movie>(
      `${this.baseUrl}/movie/${id}`,
      { params: this.buildParams() }
    );
  }

  getMovieCredits(id: number): Observable<CreditsResponse> {
    return this.http.get<CreditsResponse>(
      `${this.baseUrl}/movie/${id}/credits`,
      { params: this.buildParams() }
    );
  }

  getMovieVideos(id: number): Observable<VideosResponse> {
    return this.http.get<VideosResponse>(
      `${this.baseUrl}/movie/${id}/videos`,
      { params: this.buildParams() }
    );
  }

  getMovieImages(id: number): Observable<ImagesResponse> {
    return this.http.get<ImagesResponse>(
      `${this.baseUrl}/movie/${id}/images`,
      { params: this.buildParams() }
    );
  }

  getMovieReviews(id: number, page = 1): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(
      `${this.baseUrl}/movie/${id}/reviews`,
      { params: this.buildParams({ page }) }
    );
  }

  getSimilarMovies(id: number, page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${this.baseUrl}/movie/${id}/similar`,
      { params: this.buildParams({ page }) }
    );
  }

  getMovieRecommendations(id: number, page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${this.baseUrl}/movie/${id}/recommendations`,
      { params: this.buildParams({ page }) }
    );
  }

  // TV Shows
  getPopularTVShows(page = 1): Observable<PaginatedResponse<TVShow>> {
    return this.http.get<PaginatedResponse<TVShow>>(
      `${this.baseUrl}/tv/popular`,
      { params: this.buildParams({ page }) }
    );
  }

  getTVDetails(id: number): Observable<TVShow> {
    return this.http.get<TVShow>(
      `${this.baseUrl}/tv/${id}`,
      { params: this.buildParams() }
    );
  }

  getTVCredits(id: number): Observable<CreditsResponse> {
    return this.http.get<CreditsResponse>(
      `${this.baseUrl}/tv/${id}/credits`,
      { params: this.buildParams() }
    );
  }

  getTVVideos(id: number): Observable<VideosResponse> {
    return this.http.get<VideosResponse>(
      `${this.baseUrl}/tv/${id}/videos`,
      { params: this.buildParams() }
    );
  }

  getTVImages(id: number): Observable<ImagesResponse> {
    return this.http.get<ImagesResponse>(
      `${this.baseUrl}/tv/${id}/images`,
      { params: this.buildParams() }
    );
  }

  getTVReviews(id: number, page = 1): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(
      `${this.baseUrl}/tv/${id}/reviews`,
      { params: this.buildParams({ page }) }
    );
  }

  getSimilarTVShows(id: number, page = 1): Observable<PaginatedResponse<TVShow>> {
    return this.http.get<PaginatedResponse<TVShow>>(
      `${this.baseUrl}/tv/${id}/similar`,
      { params: this.buildParams({ page }) }
    );
  }

  getTVRecommendations(id: number, page = 1): Observable<PaginatedResponse<TVShow>> {
    return this.http.get<PaginatedResponse<TVShow>>(
      `${this.baseUrl}/tv/${id}/recommendations`,
      { params: this.buildParams({ page }) }
    );
  }

  // Watch Providers
  getWatchProviders(id: number, mediaType: 'movie' | 'tv'): Observable<{ id: number; results: Record<string, WatchProviderResult> }> {
    return this.http.get<{ id: number; results: Record<string, WatchProviderResult> }>(
      `${this.baseUrl}/${mediaType}/${id}/watch/providers`,
      { params: this.buildParams() }
    );
  }

  // Person
  getPersonDetails(id: number): Observable<Person> {
    return this.http.get<Person>(
      `${this.baseUrl}/person/${id}`,
      { params: this.buildParams() }
    );
  }

  getPersonMovieCredits(id: number): Observable<PersonMovieCredits> {
    return this.http.get<PersonMovieCredits>(
      `${this.baseUrl}/person/${id}/movie_credits`,
      { params: this.buildParams() }
    );
  }

  getPersonTVCredits(id: number): Observable<PersonTVCredits> {
    return this.http.get<PersonTVCredits>(
      `${this.baseUrl}/person/${id}/tv_credits`,
      { params: this.buildParams() }
    );
  }

  // Search
  searchMulti(query: string, page = 1): Observable<PaginatedResponse<SearchResult>> {
    return this.http.get<PaginatedResponse<SearchResult>>(
      `${this.baseUrl}/search/multi`,
      { params: this.buildParams({ query, page }) }
    );
  }

  searchMovies(query: string, page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(
      `${this.baseUrl}/search/movie`,
      { params: this.buildParams({ query, page }) }
    );
  }

  searchTVShows(query: string, page = 1): Observable<PaginatedResponse<TVShow>> {
    return this.http.get<PaginatedResponse<TVShow>>(
      `${this.baseUrl}/search/tv`,
      { params: this.buildParams({ query, page }) }
    );
  }

  searchPeople(query: string, page = 1): Observable<PaginatedResponse<Person>> {
    return this.http.get<PaginatedResponse<Person>>(
      `${this.baseUrl}/search/person`,
      { params: this.buildParams({ query, page }) }
    );
  }

  // Discover
  discoverMovies(params: DiscoverParams = {}): Observable<PaginatedResponse<Movie>> {
    const extra: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        extra[k] = v as string | number | boolean;
      }
    }
    return this.http.get<PaginatedResponse<Movie>>(
      `${this.baseUrl}/discover/movie`,
      { params: this.buildParams(extra) }
    );
  }

  discoverTVShows(params: DiscoverParams = {}): Observable<PaginatedResponse<TVShow>> {
    const extra: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        extra[k] = v as string | number | boolean;
      }
    }
    return this.http.get<PaginatedResponse<TVShow>>(
      `${this.baseUrl}/discover/tv`,
      { params: this.buildParams(extra) }
    );
  }

  // Genres
  getMovieGenres(): Observable<{ genres: Genre[] }> {
    return this.http.get<{ genres: Genre[] }>(
      `${this.baseUrl}/genre/movie/list`,
      { params: this.buildParams() }
    );
  }

  getTVGenres(): Observable<{ genres: Genre[] }> {
    return this.http.get<{ genres: Genre[] }>(
      `${this.baseUrl}/genre/tv/list`,
      { params: this.buildParams() }
    );
  }

  // Random Movie
  getRandomMovie(): Observable<PaginatedResponse<Movie>> {
    const randomPage = Math.floor(Math.random() * 20) + 1;
    return this.discoverMovies({ page: randomPage, sort_by: 'popularity.desc' });
  }

  // Image URL helpers
  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return 'assets/placeholder.svg';
    return `${environment.tmdbImageUrl}${size}${path}`;
  }

  getPosterUrl(path: string | null): string {
    return this.getImageUrl(path, 'w342');
  }

  getBackdropUrl(path: string | null): string {
    return this.getImageUrl(path, 'w1280');
  }

  getProfileUrl(path: string | null): string {
    return this.getImageUrl(path, 'w185');
  }
}
