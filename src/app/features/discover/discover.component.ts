import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TmdbService } from '../../core/services/tmdb.service';
import { MediaCardComponent } from '../../shared/components/media-card/media-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { Movie, TVShow, Genre } from '../../core/models/tmdb.models';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InfiniteScrollModule, MediaCardComponent, SkeletonCardComponent],
  template: `
    <div class="discover-page">
      <div class="page-header">
        <div class="container">
          <h1>Discover</h1>
          <p>Find your next favorite film or show</p>
        </div>
      </div>

      <div class="container discover-layout">
        <!-- Filters Sidebar -->
        <aside class="filters-panel">
          <div class="filters-header">
            <h3>Filters</h3>
            <button class="btn btn-ghost" (click)="resetFilters()">Reset</button>
          </div>

          <!-- Surprise Me — at top so it's always reachable -->
          <button class="btn btn-primary surprise-btn" (click)="surpriseMe()" [disabled]="surpriseLoading()">
            @if (surpriseLoading()) {
              <span class="spinner-sm"></span> Loading...
            } @else {
              🎲 Surprise Me!
            }
          </button>

          @if (surpriseItem()) {
            <div class="surprise-result">
              <p class="surprise-label">Your pick:</p>
              <a [routerLink]="['/movies', surpriseItem()!.id]" class="surprise-card">
                <img [src]="getPosterUrl(surpriseItem()!.poster_path)" [alt]="surpriseItem()!.title" />
                <div>
                  <p class="surprise-title">{{ surpriseItem()!.title }}</p>
                  <p class="surprise-year">{{ (surpriseItem()!.release_date || '').slice(0, 4) }}</p>
                  <p class="surprise-rating">⭐ {{ surpriseItem()!.vote_average.toFixed(1) }}</p>
                </div>
              </a>
            </div>
          }

          <div class="filter-divider"></div>

          <div class="filter-group">
            <label class="form-label">Media Type</label>
            <div class="toggle-group">
              <button class="toggle-btn" [class.active]="mediaType() === 'movie'" (click)="setMediaType('movie')">Movies</button>
              <button class="toggle-btn" [class.active]="mediaType() === 'tv'" (click)="setMediaType('tv')">TV Shows</button>
            </div>
          </div>

          <div class="filter-group">
            <label class="form-label">Sort By</label>
            <select class="form-select" [(ngModel)]="filters.sort_by" (change)="applyFilters()">
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="release_date.desc">Newest First</option>
              <option value="revenue.desc">Highest Revenue</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="form-label">Genre</label>
            <select class="form-select" [(ngModel)]="filters.with_genres" (change)="applyFilters()">
              <option value="">All Genres</option>
              @for (genre of genres(); track genre.id) {
                <option [value]="genre.id">{{ genre.name }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label class="form-label">Year (from)</label>
            <select class="form-select" [(ngModel)]="filters.year_from" (change)="applyFilters()">
              <option value="">Any</option>
              @for (year of years; track year) {
                <option [value]="year">{{ year }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label class="form-label">Year (to)</label>
            <select class="form-select" [(ngModel)]="filters.year_to" (change)="applyFilters()">
              <option value="">Any</option>
              @for (year of years; track year) {
                <option [value]="year">{{ year }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label class="form-label">Min Rating</label>
            <select class="form-select" [(ngModel)]="filters.vote_min" (change)="applyFilters()">
              <option value="">Any</option>
              <option value="9">9+</option>
              <option value="8">8+</option>
              <option value="7">7+</option>
              <option value="6">6+</option>
              <option value="5">5+</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="form-label">Language</label>
            <select class="form-select" [(ngModel)]="filters.language" (change)="applyFilters()">
              <option value="">Any</option>
              <option value="en">English</option>
              <option value="ko">Korean</option>
              <option value="ja">Japanese</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>
        </aside>

        <!-- Results -->
        <div class="results-area">
          @if (totalResults() > 0) {
            <div class="results-info">{{ totalResults() }} results found</div>
          }

          <div
            class="media-grid"
            infiniteScroll
            [infiniteScrollDistance]="2"
            [infiniteScrollThrottle]="300"
            (scrolled)="loadMore()"
          >
            @for (item of items(); track item.id) {
              <app-media-card [item]="item" [mediaType]="mediaType()" />
            }
            @if (loading()) {
              @for (i of skeletons; track i) {
                <app-skeleton-card />
              }
            }
          </div>

          @if (!loading() && items().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">🔍</div>
              <h3>No results found</h3>
              <p>Try adjusting your filters</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .discover-page { min-height: 100vh; }

    .page-header {
      background: linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary));
      padding: 3rem 0 2rem;
      h1 { margin-bottom: 0.5rem; }
      p { color: var(--text-muted); font-size: 0.875rem; }
    }

    .discover-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      padding-top: 2rem;
      padding-bottom: 3rem;

      @media (min-width: 768px) {
        grid-template-columns: 260px 1fr;
      }
    }

    .filters-panel {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 90px;
      max-height: calc(100vh - 110px);
      overflow-y: auto;
    }

    .filter-divider {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: 1rem 0;
    }

    .filters-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);

      h3 { font-size: 1rem; font-weight: 700; }
    }

    .filter-group { margin-bottom: 1rem; }

    .toggle-group {
      display: flex;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      overflow: hidden;
    }

    .toggle-btn {
      flex: 1;
      padding: 0.4rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;

      &:hover { background: var(--bg-secondary); color: var(--text-primary); }
      &.active { background: var(--accent-color); color: white; }
    }

    .surprise-btn {
      width: 100%;
      margin-top: 0.5rem;
      margin-bottom: 1rem;

      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .spinner-sm {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      display: inline-block;
      animation: spin 0.8s linear infinite;
    }

    .surprise-result {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.75rem;
    }

    .surprise-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 600; }

    .surprise-card {
      display: flex;
      gap: 0.75rem;
      text-decoration: none;
      align-items: center;
      &:hover .surprise-title { color: var(--accent-color); }
      img { width: 48px; height: 72px; object-fit: cover; border-radius: 4px; background: var(--bg-secondary); }
    }

    .surprise-title { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); transition: color 0.2s; }
    .surprise-year, .surprise-rating { font-size: 0.75rem; color: var(--text-muted); }

    .results-info { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem; }
  `]
})
export class DiscoverComponent implements OnInit {
  private tmdb = inject(TmdbService);

  items = signal<(Movie | TVShow)[]>([]);
  genres = signal<Genre[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  totalResults = signal(0);
  mediaType = signal<'movie' | 'tv'>('movie');
  surpriseItem = signal<Movie | null>(null);
  surpriseLoading = signal(false);
  skeletons = Array(12).fill(0);

  filters = {
    sort_by: 'popularity.desc',
    with_genres: '',
    year_from: '',
    year_to: '',
    vote_min: '',
    language: ''
  };

  years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

  ngOnInit(): void {
    this.loadGenres();
    this.loadItems(1);
  }

  loadGenres(): void {
    const obs = this.mediaType() === 'movie'
      ? this.tmdb.getMovieGenres()
      : this.tmdb.getTVGenres();
    obs.subscribe(res => this.genres.set(res.genres));
  }

  buildParams(page: number): any {
    const p: any = { sort_by: this.filters.sort_by, page };
    if (this.filters.with_genres) p.with_genres = this.filters.with_genres;
    if (this.filters.vote_min) p['vote_average.gte'] = Number(this.filters.vote_min);
    if (this.filters.language) p.with_original_language = this.filters.language;

    if (this.mediaType() === 'movie') {
      if (this.filters.year_from) p['primary_release_date.gte'] = `${this.filters.year_from}-01-01`;
      if (this.filters.year_to) p['primary_release_date.lte'] = `${this.filters.year_to}-12-31`;
    } else {
      if (this.filters.year_from) p['air_date.gte'] = `${this.filters.year_from}-01-01`;
      if (this.filters.year_to) p['air_date.lte'] = `${this.filters.year_to}-12-31`;
    }
    return p;
  }

  loadItems(page: number): void {
    this.loading.set(true);
    const params = this.buildParams(page);
    const handleResponse = (res: { results: (Movie | TVShow)[]; page: number; total_pages: number; total_results: number }) => {
      if (page === 1) {
        this.items.set(res.results);
      } else {
        this.items.update(i => [...i, ...res.results]);
      }
      this.currentPage.set(res.page);
      this.totalPages.set(res.total_pages);
      this.totalResults.set(res.total_results);
      this.loading.set(false);
    };

    if (this.mediaType() === 'movie') {
      this.tmdb.discoverMovies(params).subscribe({ next: handleResponse, error: () => this.loading.set(false) });
    } else {
      this.tmdb.discoverTVShows(params).subscribe({ next: handleResponse, error: () => this.loading.set(false) });
    }
  }

  setMediaType(type: 'movie' | 'tv'): void {
    this.mediaType.set(type);
    this.items.set([]);
    this.surpriseItem.set(null);
    this.loadGenres();
    this.loadItems(1);
  }

  applyFilters(): void {
    this.items.set([]);
    this.loadItems(1);
  }

  resetFilters(): void {
    this.filters = { sort_by: 'popularity.desc', with_genres: '', year_from: '', year_to: '', vote_min: '', language: '' };
    this.applyFilters();
  }

  loadMore(): void {
    if (!this.loading() && this.currentPage() < this.totalPages()) {
      this.loadItems(this.currentPage() + 1);
    }
  }

  surpriseMe(): void {
    this.surpriseLoading.set(true);
    this.tmdb.getRandomMovie().subscribe({
      next: (res) => {
        const filtered = res.results.filter((m: any) => m.poster_path && m.vote_average > 5);
        const random = filtered[Math.floor(Math.random() * filtered.length)] as Movie;
        this.surpriseItem.set(random || null);
        this.surpriseLoading.set(false);
      },
      error: () => this.surpriseLoading.set(false)
    });
  }

  getPosterUrl(path: string | null): string {
    return this.tmdb.getPosterUrl(path);
  }
}
