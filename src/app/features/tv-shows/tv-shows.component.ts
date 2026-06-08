import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TmdbService } from '../../core/services/tmdb.service';
import { MediaCardComponent } from '../../shared/components/media-card/media-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { TVShow, Genre } from '../../core/models/tmdb.models';

@Component({
  selector: 'app-tv-shows',
  standalone: true,
  imports: [CommonModule, FormsModule, InfiniteScrollModule, MediaCardComponent, SkeletonCardComponent],
  template: `
    <div class="tv-page">
      <div class="page-header">
        <div class="container">
          <h1>TV Shows</h1>
          <p>Explore popular and top-rated TV series</p>
        </div>
      </div>

      <div class="container tv-layout">
        <!-- Filters -->
        <aside class="filters-panel">
          <h3 class="filters-title">Filters</h3>

          <div class="filter-group">
            <label class="form-label">Sort By</label>
            <select class="form-select" [(ngModel)]="filters.sort_by" (change)="applyFilters()">
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="first_air_date.desc">Newest First</option>
              <option value="vote_count.desc">Most Voted</option>
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
            <label class="form-label">Year</label>
            <select class="form-select" [(ngModel)]="filters.first_air_date_year" (change)="applyFilters()">
              <option value="">All Years</option>
              @for (year of years; track year) {
                <option [value]="year">{{ year }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label class="form-label">Min Rating</label>
            <select class="form-select" [(ngModel)]="filters.vote_average_gte" (change)="applyFilters()">
              <option value="">Any Rating</option>
              <option value="9">9+</option>
              <option value="8">8+</option>
              <option value="7">7+</option>
              <option value="6">6+</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="form-label">Language</label>
            <select class="form-select" [(ngModel)]="filters.with_original_language" (change)="applyFilters()">
              <option value="">All Languages</option>
              <option value="en">English</option>
              <option value="ko">Korean</option>
              <option value="ja">Japanese</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>

          <button class="btn btn-secondary reset-btn" (click)="resetFilters()">
            Reset Filters
          </button>
        </aside>

        <!-- Results -->
        <div class="results-area">
          @if (totalResults() > 0) {
            <div class="results-info">
              <span>{{ totalResults() }} shows found</span>
            </div>
          }

          <div
            class="media-grid"
            infiniteScroll
            [infiniteScrollDistance]="2"
            [infiniteScrollThrottle]="300"
            (scrolled)="loadMore()"
          >
            @for (show of shows(); track show.id) {
              <app-media-card [item]="show" mediaType="tv" />
            }
            @if (loading()) {
              @for (i of skeletons; track i) {
                <app-skeleton-card />
              }
            }
          </div>

          @if (!loading() && shows().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">📺</div>
              <h3>No TV shows found</h3>
              <p>Try adjusting your filters</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tv-page { min-height: 100vh; }

    .page-header {
      background: linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary));
      padding: 3rem 0 2rem;
      h1 { margin-bottom: 0.5rem; }
      p { color: var(--text-muted); font-size: 0.875rem; }
    }

    .tv-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      padding-top: 2rem;
      padding-bottom: 3rem;

      @media (min-width: 768px) {
        grid-template-columns: 240px 1fr;
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
    }

    .filters-title {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }

    .filter-group { margin-bottom: 1rem; }

    .reset-btn { width: 100%; margin-top: 0.5rem; }

    .results-info {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
  `]
})
export class TvShowsComponent implements OnInit {
  private tmdb = inject(TmdbService);

  shows = signal<TVShow[]>([]);
  genres = signal<Genre[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  totalResults = signal(0);
  skeletons = Array(12).fill(0);

  filters = {
    sort_by: 'popularity.desc',
    with_genres: '',
    first_air_date_year: '',
    vote_average_gte: '',
    with_original_language: ''
  };

  years = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

  ngOnInit(): void {
    this.tmdb.getTVGenres().subscribe(res => this.genres.set(res.genres));
    this.loadShows(1);
  }

  loadShows(page: number): void {
    this.loading.set(true);
    const params: any = { sort_by: this.filters.sort_by, page };
    if (this.filters.with_genres) params.with_genres = this.filters.with_genres;
    if (this.filters.first_air_date_year) params.first_air_date_year = Number(this.filters.first_air_date_year);
    if (this.filters.vote_average_gte) params['vote_average.gte'] = Number(this.filters.vote_average_gte);
    if (this.filters.with_original_language) params.with_original_language = this.filters.with_original_language;

    this.tmdb.discoverTVShows(params).subscribe({
      next: (res) => {
        if (page === 1) {
          this.shows.set(res.results);
        } else {
          this.shows.update(s => [...s, ...res.results]);
        }
        this.currentPage.set(res.page);
        this.totalPages.set(res.total_pages);
        this.totalResults.set(res.total_results);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilters(): void {
    this.shows.set([]);
    this.loadShows(1);
  }

  resetFilters(): void {
    this.filters = {
      sort_by: 'popularity.desc',
      with_genres: '',
      first_air_date_year: '',
      vote_average_gte: '',
      with_original_language: ''
    };
    this.applyFilters();
  }

  loadMore(): void {
    if (!this.loading() && this.currentPage() < this.totalPages()) {
      this.loadShows(this.currentPage() + 1);
    }
  }
}
