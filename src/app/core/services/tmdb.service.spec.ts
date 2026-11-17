import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { TmdbService } from './tmdb.service';

describe('TmdbService', () => {
  let service: TmdbService;
  let http: HttpTestingController;
  const base = environment.tmdbBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TmdbService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify()); // no unexpected requests

  it('sends the API key with every request', () => {
    service.getPopularMovies().subscribe();
    service.getMovieDetails(550).subscribe();

    const requests = http.match(() => true);
    expect(requests.length).toBe(2);
    for (const request of requests) {
      expect(request.request.params.get('api_key')).toBe(environment.tmdbApiKey);
      request.flush({});
    }
  });

  it('builds the trending URL from the media type and time window', () => {
    service.getTrending('tv', 'week').subscribe();

    const request = http.expectOne((r) => r.url === `${base}/trending/tv/week`);
    expect(request.request.method).toBe('GET');
    request.flush({ results: [] });
  });

  it('passes search text and page through, encoded safely', () => {
    let total = 0;
    service.searchMulti('Amélie & co', 2).subscribe((res) => (total = res.total_results));

    const request = http.expectOne((r) => r.url === `${base}/search/multi`);
    expect(request.request.params.get('query')).toBe('Amélie & co');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.urlWithParams).toContain('query=Am%C3%A9lie%20%26%20co');
    request.flush({ page: 2, results: [], total_pages: 3, total_results: 41 });

    expect(total).toBe(41);
  });

  it('leaves unset discover filters out of the query string', () => {
    service.discoverMovies({ with_genres: '28', primary_release_year: undefined, sort_by: '' }).subscribe();

    const params = http.expectOne((r) => r.url === `${base}/discover/movie`).request.params;
    expect(params.get('with_genres')).toBe('28');
    expect(params.has('primary_release_year')).toBeFalse();
    expect(params.has('sort_by')).toBeFalse();
  });

  describe('image URLs', () => {
    it('picks the TMDB size for each kind of image', () => {
      expect(service.getPosterUrl('/abc.jpg')).toBe(`${environment.tmdbImageUrl}w342/abc.jpg`);
      expect(service.getBackdropUrl('/abc.jpg')).toBe(`${environment.tmdbImageUrl}w1280/abc.jpg`);
      expect(service.getProfileUrl('/abc.jpg')).toBe(`${environment.tmdbImageUrl}w185/abc.jpg`);
    });

    it('falls back to the placeholder in public/, which is served from the site root', () => {
      // It used to point at assets/placeholder.svg, which Angular 17+ no longer serves, so on Vercel
      // the request fell through to index.html and every title without a poster showed a broken image.
      expect(service.getPosterUrl(null)).toBe('placeholder.svg');
    });
  });
});
