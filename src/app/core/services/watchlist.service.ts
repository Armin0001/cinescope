import { Injectable, signal, computed } from '@angular/core';
import { Watchlist, WatchlistItem, MediaType } from '../models/tmdb.models';

export type WatchlistCategory = 'wantToWatch' | 'watching' | 'completed' | 'favorites';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private readonly STORAGE_KEY = 'cinescope-watchlist';

  private watchlist = signal<Watchlist>(this.loadFromStorage());

  wantToWatch = computed(() => this.watchlist().wantToWatch);
  watching = computed(() => this.watchlist().watching);
  completed = computed(() => this.watchlist().completed);
  favorites = computed(() => this.watchlist().favorites);

  totalCount = computed(() => {
    const w = this.watchlist();
    return w.wantToWatch.length + w.watching.length + w.completed.length + w.favorites.length;
  });

  private loadFromStorage(): Watchlist {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore parse errors
    }
    return {
      wantToWatch: [],
      watching: [],
      completed: [],
      favorites: []
    };
  }

  private saveToStorage(watchlist: Watchlist): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(watchlist));
  }

  addToList(category: WatchlistCategory, item: WatchlistItem): void {
    this.watchlist.update(w => {
      // Remove from all lists first
      const cleaned = this.removeFromAll(w, item.id, item.mediaType);
      const updated = {
        ...cleaned,
        [category]: [...cleaned[category], { ...item, addedAt: new Date().toISOString() }]
      };
      this.saveToStorage(updated);
      return updated;
    });
  }

  removeFromList(category: WatchlistCategory, id: number, mediaType: MediaType): void {
    this.watchlist.update(w => {
      const updated = {
        ...w,
        [category]: w[category].filter(i => !(i.id === id && i.mediaType === mediaType))
      };
      this.saveToStorage(updated);
      return updated;
    });
  }

  removeFromAllLists(id: number, mediaType: MediaType): void {
    this.watchlist.update(w => {
      const updated = this.removeFromAll(w, id, mediaType);
      this.saveToStorage(updated);
      return updated;
    });
  }

  private removeFromAll(w: Watchlist, id: number, mediaType: MediaType): Watchlist {
    return {
      wantToWatch: w.wantToWatch.filter(i => !(i.id === id && i.mediaType === mediaType)),
      watching: w.watching.filter(i => !(i.id === id && i.mediaType === mediaType)),
      completed: w.completed.filter(i => !(i.id === id && i.mediaType === mediaType)),
      favorites: w.favorites.filter(i => !(i.id === id && i.mediaType === mediaType))
    };
  }

  getItemCategory(id: number, mediaType: MediaType): WatchlistCategory | null {
    const w = this.watchlist();
    if (w.wantToWatch.some(i => i.id === id && i.mediaType === mediaType)) return 'wantToWatch';
    if (w.watching.some(i => i.id === id && i.mediaType === mediaType)) return 'watching';
    if (w.completed.some(i => i.id === id && i.mediaType === mediaType)) return 'completed';
    if (w.favorites.some(i => i.id === id && i.mediaType === mediaType)) return 'favorites';
    return null;
  }

  isInWatchlist(id: number, mediaType: MediaType): boolean {
    return this.getItemCategory(id, mediaType) !== null;
  }

  moveToCategory(id: number, mediaType: MediaType, newCategory: WatchlistCategory): void {
    const w = this.watchlist();
    let item: WatchlistItem | undefined;
    for (const cat of ['wantToWatch', 'watching', 'completed', 'favorites'] as WatchlistCategory[]) {
      item = w[cat].find(i => i.id === id && i.mediaType === mediaType);
      if (item) break;
    }
    if (item) {
      this.addToList(newCategory, item);
    }
  }
}
