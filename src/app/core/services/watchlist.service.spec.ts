import { TestBed } from '@angular/core/testing';
import { WatchlistItem } from '../models/tmdb.models';
import { WatchlistService } from './watchlist.service';

const STORAGE_KEY = 'cinescope-watchlist';

const item = (id: number, mediaType: 'movie' | 'tv' = 'movie', title = `Title ${id}`): WatchlistItem => ({
  id,
  mediaType,
  title,
  posterPath: null,
  voteAverage: 7.5,
  releaseDate: '2024-01-01',
  addedAt: '',
});

describe('WatchlistService', () => {
  let service: WatchlistService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(WatchlistService);
  });

  afterEach(() => localStorage.clear());

  it('starts with four empty lists', () => {
    expect(service.totalCount()).toBe(0);
    expect(service.wantToWatch()).toEqual([]);
    expect(service.favorites()).toEqual([]);
  });

  it('keeps a title in one list at a time', () => {
    service.addToList('wantToWatch', item(1));
    service.addToList('watching', item(1));

    expect(service.wantToWatch()).toEqual([]);
    expect(service.watching().map((i) => i.id)).toEqual([1]);
    expect(service.getItemCategory(1, 'movie')).toBe('watching');
    expect(service.totalCount()).toBe(1);
  });

  it('treats a movie and a TV show with the same TMDB id as different titles', () => {
    service.addToList('favorites', item(42, 'movie'));
    service.addToList('watching', item(42, 'tv'));

    expect(service.getItemCategory(42, 'movie')).toBe('favorites');
    expect(service.getItemCategory(42, 'tv')).toBe('watching');
    expect(service.totalCount()).toBe(2);
  });

  it('stamps the time a title was added', () => {
    service.addToList('completed', item(7));

    expect(Date.parse(service.completed()[0].addedAt)).not.toBeNaN();
  });

  it('moves a title between lists without losing its details', () => {
    service.addToList('wantToWatch', item(3, 'tv', 'Severance'));
    service.moveToCategory(3, 'tv', 'completed');

    expect(service.wantToWatch()).toEqual([]);
    expect(service.completed().map((i) => i.title)).toEqual(['Severance']);
  });

  it('ignores a move for a title that is not in any list', () => {
    service.moveToCategory(99, 'movie', 'favorites');

    expect(service.totalCount()).toBe(0);
  });

  it('removes a title from one list, or from all of them', () => {
    service.addToList('favorites', item(5));
    service.addToList('watching', item(6));

    service.removeFromList('favorites', 5, 'movie');
    expect(service.isInWatchlist(5, 'movie')).toBeFalse();

    service.removeFromAllLists(6, 'movie');
    expect(service.totalCount()).toBe(0);
  });

  it('saves every change to localStorage', () => {
    service.addToList('favorites', item(8));

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.favorites.map((i: WatchlistItem) => i.id)).toEqual([8]);
  });
});

describe('WatchlistService restoring saved lists', () => {
  afterEach(() => localStorage.clear());

  it('picks up the lists saved in a previous visit', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ wantToWatch: [item(1)], watching: [], completed: [item(2)], favorites: [] }),
    );

    const service = TestBed.inject(WatchlistService);

    expect(service.totalCount()).toBe(2);
    expect(service.getItemCategory(2, 'movie')).toBe('completed');
  });

  it('starts fresh instead of crashing when the saved data is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');

    const service = TestBed.inject(WatchlistService);

    expect(service.totalCount()).toBe(0);
  });
});
