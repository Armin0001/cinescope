import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TmdbService } from '../../core/services/tmdb.service';
import { MediaCardComponent } from '../../shared/components/media-card/media-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { SearchResult } from '../../core/models/tmdb.models';

type FilterTab = 'all' | 'movies' | 'tv' | 'people';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, InfiniteScrollModule, MediaCardComponent, SkeletonCardComponent],
  template: `
    <div class="search-page">
      <div class="container">
        <div class="search-header">
          <h1>
            @if (query()) {
              Results for "<span class="accent-text">{{ query() }}</span>"
            } @else {
              Search
            }
          </h1>
          @if (totalResults() > 0) {
            <span class="result-count">{{ totalResults() }} results found</span>
          }
        </div>

        <!-- Filter Tabs -->
        <div class="tabs">
          @for (tab of filterTabs; track tab.value) {
            <button
              class="tab"
              [class.active]="activeFilter() === tab.value"
              (click)="setFilter(tab.value)"
            >
              {{ tab.label }}
              @if (tab.value === 'all') {
                ({{ totalResults() }})
              }
            </button>
          }
        </div>

        <!-- Results -->
        <div
          class="media-grid"
          infiniteScroll
          [infiniteScrollDistance]="2"
          [infiniteScrollThrottle]="300"
          (scrolled)="loadMore()"
        >
          @for (item of filteredResults(); track item.id + '_' + item.media_type) {
            @if (item.media_type === 'person') {
              <a [routerLink]="['/person', item.id]" class="person-card">
                <img
                  [src]="getPersonImageUrl(item)"
                  [alt]="item.name"
                  (error)="onImgError($event)"
                />
                <div class="person-card-info">
                  <p class="person-name">{{ item.name }}</p>
                  <p class="person-dept">{{ 'Person' }}</p>
                </div>
              </a>
            } @else {
              <app-media-card
                [item]="item"
                [mediaType]="item.media_type === 'tv' ? 'tv' : 'movie'"
              />
            }
          }

          @if (loading()) {
            @for (i of skeletons; track i) {
              <app-skeleton-card />
            }
          }
        </div>

        @if (!loading() && filteredResults().length === 0 && query()) {
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try a different search term or filter</p>
          </div>
        }

        @if (!query()) {
          <div class="empty-state">
            <div class="empty-icon">🎬</div>
            <h3>Search for movies, TV shows, or people</h3>
            <p>Start typing in the search bar above</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-page {
      min-height: 100vh;
      padding: 2rem 0 4rem;
    }

    .search-header {
      margin-bottom: 1.5rem;

      h1 {
        margin-bottom: 0.25rem;
      }

      .accent-text { color: var(--accent-color); }

      .result-count {
        font-size: 0.875rem;
        color: var(--text-muted);
      }
    }

    .person-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      text-decoration: none;
      transition: transform 0.2s ease;

      &:hover { transform: translateY(-3px); }

      img {
        width: 100%;
        aspect-ratio: 2/3;
        object-fit: cover;
        border-radius: 10px;
        background: var(--bg-tertiary);
      }
    }

    .person-card-info {
      padding: 0.5rem 0.25rem;
      width: 100%;
    }

    .person-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .person-dept {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  `]
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tmdb = inject(TmdbService);

  query = signal('');
  results = signal<SearchResult[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  totalResults = signal(0);
  activeFilter = signal<FilterTab>('all');
  skeletons = Array(8).fill(0);

  filterTabs = [
    { value: 'all' as FilterTab, label: 'All' },
    { value: 'movies' as FilterTab, label: 'Movies' },
    { value: 'tv' as FilterTab, label: 'TV Shows' },
    { value: 'people' as FilterTab, label: 'People' }
  ];

  filteredResults = computed(() => {
    const filter = this.activeFilter();
    const res = this.results();
    if (filter === 'all') return res;
    if (filter === 'movies') return res.filter(r => r.media_type === 'movie');
    if (filter === 'tv') return res.filter(r => r.media_type === 'tv');
    if (filter === 'people') return res.filter(r => r.media_type === 'person');
    return res;
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q') || '';
      this.query.set(q);
      if (q.length >= 1) {
        this.results.set([]);
        this.search(q, 1);
      }
    });
  }

  search(query: string, page: number): void {
    this.loading.set(true);
    this.tmdb.searchMulti(query, page).subscribe({
      next: (res) => {
        if (page === 1) {
          this.results.set(res.results as SearchResult[]);
        } else {
          this.results.update(r => [...r, ...(res.results as SearchResult[])]);
        }
        this.currentPage.set(res.page);
        this.totalPages.set(res.total_pages);
        this.totalResults.set(res.total_results);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setFilter(filter: FilterTab): void {
    this.activeFilter.set(filter);
  }

  loadMore(): void {
    if (!this.loading() && this.currentPage() < this.totalPages() && this.query()) {
      this.search(this.query(), this.currentPage() + 1);
    }
  }

  getPersonImageUrl(item: SearchResult): string {
    return this.tmdb.getProfileUrl(item.profile_path ?? null);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder.svg';
  }
}
