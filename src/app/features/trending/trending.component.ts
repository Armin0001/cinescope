import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TmdbService } from '../../core/services/tmdb.service';
import { MediaCardComponent } from '../../shared/components/media-card/media-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';

type TimeWindow = 'day' | 'week';
type MediaFilter = 'all' | 'movie' | 'tv';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule, MediaCardComponent, SkeletonCardComponent],
  template: `
    <div class="trending-page">
      <div class="page-header">
        <div class="container">
          <h1>Trending</h1>
          <p>What people are watching right now</p>
        </div>
      </div>

      <div class="container">
        <!-- Controls -->
        <div class="controls">
          <div class="toggle-group">
            <button
              class="toggle-btn"
              [class.active]="timeWindow() === 'day'"
              (click)="setTimeWindow('day')"
            >
              Today
            </button>
            <button
              class="toggle-btn"
              [class.active]="timeWindow() === 'week'"
              (click)="setTimeWindow('week')"
            >
              This Week
            </button>
          </div>

          <div class="toggle-group">
            <button
              class="toggle-btn"
              [class.active]="mediaFilter() === 'all'"
              (click)="setMediaFilter('all')"
            >
              All
            </button>
            <button
              class="toggle-btn"
              [class.active]="mediaFilter() === 'movie'"
              (click)="setMediaFilter('movie')"
            >
              Movies
            </button>
            <button
              class="toggle-btn"
              [class.active]="mediaFilter() === 'tv'"
              (click)="setMediaFilter('tv')"
            >
              TV Shows
            </button>
          </div>
        </div>

        <!-- Grid -->
        <div
          class="media-grid"
          infiniteScroll
          [infiniteScrollDistance]="2"
          [infiniteScrollThrottle]="300"
          (scrolled)="loadMore()"
        >
          @for (item of filteredItems(); track item.id + '_' + item.media_type) {
            <app-media-card [item]="item" [mediaType]="item.media_type || 'movie'" />
          }
          @if (loading()) {
            @for (i of skeletons; track i) {
              <app-skeleton-card />
            }
          }
        </div>

        @if (!loading() && filteredItems().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📈</div>
            <h3>Nothing trending right now</h3>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .trending-page { min-height: 100vh; }

    .page-header {
      background: linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary));
      padding: 3rem 0 2rem;
      margin-bottom: 2rem;
      h1 { margin-bottom: 0.5rem; }
      p { color: var(--text-muted); font-size: 0.875rem; }
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
    }

    .toggle-group {
      display: flex;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .toggle-btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;

      &:hover { background: var(--bg-tertiary); color: var(--text-primary); }
      &.active { background: var(--accent-color); color: white; }
    }
  `]
})
export class TrendingComponent implements OnInit {
  private tmdb = inject(TmdbService);

  items = signal<any[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  timeWindow = signal<TimeWindow>('day');
  mediaFilter = signal<MediaFilter>('all');
  skeletons = Array(12).fill(0);

  filteredItems = computed(() => {
    const filter = this.mediaFilter();
    const items = this.items();
    if (filter === 'all') return items;
    return items.filter(i => i.media_type === filter);
  });

  ngOnInit(): void {
    this.loadTrending(1);
  }

  loadTrending(page: number): void {
    this.loading.set(true);
    const mediaType = this.mediaFilter() === 'all' ? 'all' : this.mediaFilter() as 'movie' | 'tv';

    this.tmdb.getTrending(mediaType, this.timeWindow()).subscribe({
      next: (res) => {
        const mapped = res.results.map((r: any) => ({
          ...r,
          media_type: r.media_type || (this.mediaFilter() !== 'all' ? this.mediaFilter() : 'movie')
        }));
        if (page === 1) {
          this.items.set(mapped);
        } else {
          this.items.update(i => [...i, ...mapped]);
        }
        this.currentPage.set(res.page);
        this.totalPages.set(res.total_pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setTimeWindow(tw: TimeWindow): void {
    this.timeWindow.set(tw);
    this.items.set([]);
    this.loadTrending(1);
  }

  setMediaFilter(mf: MediaFilter): void {
    this.mediaFilter.set(mf);
    this.items.set([]);
    this.loadTrending(1);
  }

  loadMore(): void {
    if (!this.loading() && this.currentPage() < this.totalPages()) {
      this.loadTrending(this.currentPage() + 1);
    }
  }
}
