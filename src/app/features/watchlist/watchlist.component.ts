import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WatchlistService, WatchlistCategory } from '../../core/services/watchlist.service';
import { TmdbService } from '../../core/services/tmdb.service';
import { WatchlistItem } from '../../core/models/tmdb.models';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="watchlist-page">
      <div class="container">
        <div class="page-header-section">
          <h1>My Watchlist</h1>
          <p>{{ totalCount() }} items across all lists</p>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          @for (tab of tabs; track tab.value) {
            <button
              class="tab"
              [class.active]="activeTab() === tab.value"
              (click)="activeTab.set(tab.value)"
            >
              {{ tab.label }}
              <span class="tab-count">{{ getCount(tab.value) }}</span>
            </button>
          }
        </div>

        <!-- List Content -->
        @if (currentItems().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">{{ activeTabEmoji() }}</div>
            <h3>{{ emptyTitle() }}</h3>
            <p>{{ emptyMessage() }}</p>
            <a routerLink="/movies" class="btn btn-primary">Browse Movies</a>
          </div>
        } @else {
          <div class="watchlist-grid">
            @for (item of currentItems(); track item.id + '_' + item.mediaType) {
              <div class="watchlist-card" [routerLink]="getDetailLink(item)">
                <div class="card-poster">
                  <img [src]="getPosterUrl(item.posterPath)" [alt]="item.title" (error)="onImgError($event)" />
                  <div class="card-badge" [class]="'badge-' + item.mediaType">
                    {{ item.mediaType === 'tv' ? 'TV' : 'Movie' }}
                  </div>
                </div>
                <div class="card-info">
                  <h3 class="card-title">{{ item.title }}</h3>
                  <div class="card-meta">
                    <span class="card-year">{{ (item.releaseDate || '').slice(0, 4) }}</span>
                    @if (item.voteAverage > 0) {
                      <span class="card-rating">⭐ {{ item.voteAverage.toFixed(1) }}</span>
                    }
                  </div>
                  <p class="card-added">Added {{ item.addedAt | date:'mediumDate' }}</p>
                  <div class="card-actions" (click)="$event.stopPropagation()">
                    <div class="move-dropdown">
                      <button class="btn btn-ghost btn-sm" (click)="toggleMoveMenu(item)">Move to ▾</button>
                      @if (openMoveMenu() === (item.id + '_' + item.mediaType)) {
                        <div class="move-menu">
                          @for (tab of otherTabs(); track tab.value) {
                            <button class="move-item" (click)="moveItem(item, tab.value)">
                              {{ tab.label }}
                            </button>
                          }
                        </div>
                      }
                    </div>
                    <button class="btn btn-ghost btn-sm remove-btn" (click)="removeItem(item)">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .watchlist-page {
      min-height: 100vh;
      padding: 2rem 0 4rem;
    }

    .page-header-section {
      margin-bottom: 2rem;

      h1 { margin-bottom: 0.25rem; }
      p { color: var(--text-muted); font-size: 0.875rem; }
    }

    .tab-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 0.25rem;
      background: var(--bg-tertiary);
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 700;
      margin-left: 0.375rem;
      color: var(--text-muted);
    }

    .tab.active .tab-count {
      background: rgba(229, 9, 20, 0.15);
      color: var(--accent-color);
    }

    .watchlist-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;

      @media (min-width: 480px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
      }

      @media (min-width: 1280px) {
        grid-template-columns: repeat(5, 1fr);
      }
    }

    .watchlist-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--border-hover);
        box-shadow: var(--shadow);
        transform: translateY(-2px);
      }
    }

    .card-poster {
      position: relative;
      aspect-ratio: 2/3;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: var(--bg-tertiary);
      }

      .card-badge {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;

        &.badge-movie { background: rgba(59,130,246,0.85); color: white; }
        &.badge-tv { background: rgba(34,197,94,0.85); color: white; }
      }
    }

    .card-info {
      padding: 0.75rem;
    }

    .card-title {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.375rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .card-year, .card-rating {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .card-added {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-sm {
      font-size: 0.75rem;
      padding: 0.3rem 0.6rem;
    }

    .remove-btn { color: #ef4444 !important; }

    .move-dropdown {
      position: relative;
    }

    .move-menu {
      position: absolute;
      bottom: 100%;
      left: 0;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      z-index: 50;
      min-width: 160px;
      box-shadow: var(--shadow-lg);
      margin-bottom: 0.25rem;
    }

    .move-item {
      display: block;
      width: 100%;
      padding: 0.6rem 0.875rem;
      font-size: 0.8rem;
      color: var(--text-primary);
      text-align: left;
      cursor: pointer;
      background: none;
      border: none;
      transition: background 0.2s ease;
      font-family: inherit;

      &:hover { background: var(--bg-tertiary); }
    }
  `]
})
export class WatchlistComponent {
  private watchlistService = inject(WatchlistService);
  private tmdb = inject(TmdbService);

  activeTab = signal<WatchlistCategory>('wantToWatch');
  openMoveMenu = signal<string | null>(null);

  tabs = [
    { value: 'wantToWatch' as WatchlistCategory, label: '📋 Want to Watch', emoji: '📋' },
    { value: 'watching' as WatchlistCategory, label: '▶️ Watching', emoji: '▶️' },
    { value: 'completed' as WatchlistCategory, label: '✅ Completed', emoji: '✅' },
    { value: 'favorites' as WatchlistCategory, label: '❤️ Favorites', emoji: '❤️' }
  ];

  totalCount = computed(() => this.watchlistService.totalCount());

  currentItems = computed((): WatchlistItem[] => {
    const tab = this.activeTab();
    switch (tab) {
      case 'wantToWatch': return this.watchlistService.wantToWatch();
      case 'watching': return this.watchlistService.watching();
      case 'completed': return this.watchlistService.completed();
      case 'favorites': return this.watchlistService.favorites();
    }
  });

  otherTabs = computed(() => this.tabs.filter(t => t.value !== this.activeTab()));

  activeTabEmoji = computed(() => {
    return this.tabs.find(t => t.value === this.activeTab())?.emoji || '🎬';
  });

  emptyTitle = computed(() => {
    switch (this.activeTab()) {
      case 'wantToWatch': return 'Nothing in your Want to Watch list';
      case 'watching': return "You're not watching anything";
      case 'completed': return "You haven't completed anything yet";
      case 'favorites': return "You haven't added any favorites";
    }
  });

  emptyMessage = computed(() => {
    switch (this.activeTab()) {
      case 'wantToWatch': return 'Browse movies and TV shows to add them here.';
      case 'watching': return 'Mark something as currently watching.';
      case 'completed': return 'Move items here when you finish watching them.';
      case 'favorites': return 'Add your all-time favorite titles here.';
    }
  });

  getCount(category: WatchlistCategory): number {
    switch (category) {
      case 'wantToWatch': return this.watchlistService.wantToWatch().length;
      case 'watching': return this.watchlistService.watching().length;
      case 'completed': return this.watchlistService.completed().length;
      case 'favorites': return this.watchlistService.favorites().length;
    }
  }

  getPosterUrl(path: string | null): string {
    return this.tmdb.getPosterUrl(path);
  }

  getDetailLink(item: WatchlistItem): string[] {
    return item.mediaType === 'tv' ? ['/tv', String(item.id)] : ['/movies', String(item.id)];
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder.svg';
  }

  removeItem(item: WatchlistItem): void {
    this.watchlistService.removeFromList(this.activeTab(), item.id, item.mediaType);
    this.openMoveMenu.set(null);
  }

  toggleMoveMenu(item: WatchlistItem): void {
    const key = `${item.id}_${item.mediaType}`;
    this.openMoveMenu.update(v => v === key ? null : key);
  }

  moveItem(item: WatchlistItem, targetCategory: WatchlistCategory): void {
    this.watchlistService.addToList(targetCategory, item);
    this.openMoveMenu.set(null);
  }
}
