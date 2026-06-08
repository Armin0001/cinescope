import { Component, inject, signal, computed, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { TmdbService } from '../../../core/services/tmdb.service';
import { SearchResult } from '../../../core/models/tmdb.models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled()">
      <div class="nav-container">
        <!-- Logo -->
        <a routerLink="/" class="nav-logo">
          <span class="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z"/>
            </svg>
          </span>
          <span class="logo-text">Cine<b>Scope</b></span>
        </a>

        <!-- Desktop Nav Links -->
        <ul class="nav-links hide-mobile">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="/movies" routerLinkActive="active">Movies</a></li>
          <li><a routerLink="/tv" routerLinkActive="active">TV Shows</a></li>
          <li><a routerLink="/trending" routerLinkActive="active">Trending</a></li>
          <li><a routerLink="/discover" routerLinkActive="active">Discover</a></li>
        </ul>

        <!-- Search Bar -->
        <div class="search-wrapper" [class.open]="searchOpen()">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>
            </svg>
            <input
              #searchInput
              type="text"
              placeholder="Search movies, TV shows, people…"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              (keydown.enter)="onSearchSubmit()"
              (focus)="searchFocused.set(true)"
              (blur)="onSearchBlur()"
              class="search-input"
            />
            @if (searchQuery.length > 0) {
              <button class="clear-btn" (click)="clearSearch()" aria-label="Clear search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            } @else {
              <span class="kbd-hint" aria-hidden="true"><kbd>⌘</kbd><kbd>K</kbd></span>
            }
          </div>

          <!-- Typeahead Results -->
          @if (searchFocused() && suggestions().length > 0) {
            <div class="search-dropdown">
              @for (item of suggestions(); track item.id) {
                <a
                  class="suggestion-item"
                  [routerLink]="getSuggestionLink(item)"
                  (mousedown)="navigateToSuggestion(item)"
                >
                  <div class="suggestion-type" [class]="'badge-' + (item.media_type || 'movie')">
                    {{ item.media_type === 'tv' ? 'TV' : item.media_type === 'person' ? 'Person' : 'Movie' }}
                  </div>
                  <span class="suggestion-title">{{ item.title || item.name }}</span>
                  @if (item.release_date || item.first_air_date) {
                    <span class="suggestion-year">
                      {{ (item.release_date || item.first_air_date)?.slice(0,4) }}
                    </span>
                  }
                </a>
              }
              <a class="suggestion-all" (click)="onSearchSubmit()" (mousedown)="onSearchSubmit()">
                See all results for "{{ searchQuery }}"
              </a>
            </div>
          }
        </div>

        <!-- Right Actions -->
        <div class="nav-actions">
          <!-- Search toggle mobile -->
          <button class="icon-btn show-mobile-only" (click)="toggleSearch()" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>
            </svg>
          </button>

          <!-- Theme toggle -->
          <button class="icon-btn theme-btn" (click)="toggleTheme()" [title]="isDark() ? 'Light mode' : 'Dark mode'" aria-label="Toggle theme">
            @if (isDark()) {
              <!-- Sun icon when dark (click to go light) -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>
              </svg>
            } @else {
              <!-- Moon icon when light (click to go dark) -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>
              </svg>
            }
          </button>

          <span class="nav-divider hide-mobile"></span>

          <!-- Watchlist -->
          <a routerLink="/watchlist" class="watchlist-btn" aria-label="Watchlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"/>
            </svg>
            @if (watchlistCount() > 0) {
              <span class="watchlist-badge">{{ watchlistCount() }}</span>
            }
          </a>

          <!-- Mobile hamburger -->
          <button class="hamburger show-mobile-only" (click)="toggleMenu()" [class.open]="menuOpen()" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (menuOpen()) {
        <div class="mobile-menu">
          <ul>
            <li><a routerLink="/" (click)="closeMenu()">Home</a></li>
            <li><a routerLink="/movies" (click)="closeMenu()">Movies</a></li>
            <li><a routerLink="/tv" (click)="closeMenu()">TV Shows</a></li>
            <li><a routerLink="/trending" (click)="closeMenu()">Trending</a></li>
            <li><a routerLink="/discover" (click)="closeMenu()">Discover</a></li>
            <li><a routerLink="/watchlist" (click)="closeMenu()">Watchlist</a></li>
          </ul>
        </div>
      }
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      /* Navbar-only tokens, derived from the global theme */
      --nav-glass: rgba(12, 12, 14, 0.72);
      --nav-pill: rgba(255, 255, 255, 0.06);
      --nav-pill-hover: rgba(255, 255, 255, 0.10);
      --nav-ring: rgba(229, 9, 20, 0.35);
    }
    :host-context([data-theme="light"]) {
      --nav-glass: rgba(255, 255, 255, 0.78);
      --nav-pill: rgba(0, 0, 0, 0.04);
      --nav-pill-hover: rgba(0, 0, 0, 0.07);
      --nav-ring: rgba(229, 9, 20, 0.20);
    }

    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background: transparent;
      border-bottom: 1px solid transparent;
      transition: background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease;

      &.scrolled {
        background: var(--nav-glass);
        backdrop-filter: blur(18px) saturate(140%);
        -webkit-backdrop-filter: blur(18px) saturate(140%);
        border-bottom: 1px solid var(--border-color);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.28);
      }
    }

    .nav-container {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 0 1.5rem;
      height: 68px;
      max-width: 1440px;
      margin: 0 auto;

      @media (min-width: 1280px) {
        padding: 0 3rem;
      }
    }

    /* ---- Logo ---- */
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-shrink: 0;
      text-decoration: none;

      .logo-mark {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        background: linear-gradient(145deg, var(--accent-hover), var(--accent-dark));
        box-shadow: 0 4px 14px rgba(229, 9, 20, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.18);
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;

        svg { width: 18px; height: 18px; color: #fff; }
      }

      &:hover .logo-mark {
        transform: translateY(-1px) rotate(-4deg);
        box-shadow: 0 6px 18px rgba(229, 9, 20, 0.5);
      }

      .logo-text {
        font-size: 1.2rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-primary);

        b { color: var(--accent-color); font-weight: 800; }
      }
    }

    /* ---- Nav links ---- */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.15rem;
      list-style: none;
      margin: 0;
      padding: 0;

      li a {
        position: relative;
        display: inline-flex;
        align-items: center;
        padding: 0.5rem 0.85rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-secondary);
        text-decoration: none;
        transition: color 0.2s ease, background 0.2s ease;

        &:hover {
          color: var(--text-primary);
          background: var(--nav-pill);
        }

        &.active {
          color: var(--text-primary);

          &::after {
            content: '';
            position: absolute;
            left: 50%;
            bottom: 4px;
            width: 18px;
            height: 2px;
            border-radius: 2px;
            background: var(--accent-color);
            transform: translateX(-50%);
            box-shadow: 0 0 8px var(--accent-color);
          }
        }
      }
    }

    /* ---- Search ---- */
    .search-wrapper {
      flex: 1;
      max-width: 420px;
      position: relative;
      margin-left: auto;

      &.open {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 68px;
        padding: 0 1rem;
        background: var(--nav-glass);
        backdrop-filter: blur(18px) saturate(140%);
        -webkit-backdrop-filter: blur(18px) saturate(140%);
        display: flex;
        align-items: center;
        z-index: 10;
        max-width: 100%;
        margin: 0;
      }
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;

      .search-icon {
        position: absolute;
        left: 0.85rem;
        width: 16px;
        height: 16px;
        color: var(--text-muted);
        pointer-events: none;
        transition: color 0.2s ease;
      }

      .search-input {
        width: 100%;
        padding: 0.62rem 3.6rem 0.62rem 2.6rem;
        background: var(--input-bg);
        border: 1px solid var(--input-border);
        border-radius: 999px;
        color: var(--text-primary);
        font-size: 0.875rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

        &::placeholder { color: var(--text-muted); }
      }

      &:focus-within {
        .search-input {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 4px var(--nav-ring);
        }
        .search-icon { color: var(--accent-color); }
      }

      .clear-btn {
        position: absolute;
        right: 0.7rem;
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--nav-pill);
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        transition: background 0.2s ease, color 0.2s ease;

        svg { width: 13px; height: 13px; }
        &:hover { background: var(--nav-pill-hover); color: var(--text-primary); }
      }

      .kbd-hint {
        position: absolute;
        right: 0.7rem;
        display: inline-flex;
        gap: 2px;
        pointer-events: none;

        kbd {
          font-family: inherit;
          font-size: 0.6rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--nav-pill);
          border: 1px solid var(--border-color);
          border-radius: 5px;
          padding: 0.12rem 0.35rem;
          line-height: 1;
        }
      }
    }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      right: 0;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      z-index: 200;
      animation: slideUp 0.2s ease;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background 0.2s ease;
      text-decoration: none;
      color: var(--text-primary);

      &:hover { background: var(--bg-tertiary); }

      .suggestion-type {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        text-transform: uppercase;
        flex-shrink: 0;

        &.badge-movie { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        &.badge-tv    { background: rgba(34, 197, 94, 0.2);  color: #4ade80; }
        &.badge-person{ background: rgba(168, 85, 247, 0.2); color: #c084fc; }
      }

      .suggestion-title {
        flex: 1;
        font-size: 0.875rem;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .suggestion-year {
        font-size: 0.75rem;
        color: var(--text-muted);
        flex-shrink: 0;
      }
    }

    .suggestion-all {
      display: block;
      padding: 0.75rem 1rem;
      font-size: 0.8rem;
      color: var(--accent-color);
      text-align: center;
      border-top: 1px solid var(--border-color);
      cursor: pointer;
      transition: background 0.2s ease;
      text-decoration: none;

      &:hover { background: var(--bg-tertiary); }
    }

    /* ---- Right actions ---- */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .nav-divider {
      width: 1px;
      height: 22px;
      background: var(--border-color);
      margin: 0 0.15rem;
    }

    .icon-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      background: var(--nav-pill);
      color: var(--text-secondary);
      border: 1px solid transparent;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;

      svg { width: 18px; height: 18px; }

      &:hover {
        background: var(--nav-pill-hover);
        color: var(--text-primary);
        border-color: var(--border-hover);
      }
      &:active { transform: scale(0.93); }
    }

    .watchlist-btn {
      position: relative;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      background: var(--nav-pill);
      color: var(--text-secondary);
      border: 1px solid transparent;
      text-decoration: none;
      transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;

      svg { width: 18px; height: 18px; }

      &:hover {
        background: var(--nav-pill-hover);
        color: var(--accent-color);
        border-color: var(--nav-ring);
      }
      &:active { transform: scale(0.93); }

      .watchlist-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        background: var(--accent-color);
        color: white;
        border-radius: 999px;
        font-size: 0.62rem;
        font-weight: 700;
        display: grid;
        place-items: center;
        border: 2px solid var(--bg-primary);
        box-shadow: 0 2px 6px rgba(229, 9, 20, 0.5);
      }
    }

    .scrolled .watchlist-badge { border-color: transparent; }

    .hamburger {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      background: var(--nav-pill);
      border: 1px solid transparent;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover { background: var(--nav-pill-hover); }

      span {
        display: block;
        width: 18px;
        height: 2px;
        background: var(--text-primary);
        border-radius: 1px;
        transition: all 0.3s ease;
      }

      &.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      &.open span:nth-child(2) { opacity: 0; }
      &.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    }

    .mobile-menu {
      background: var(--nav-glass);
      backdrop-filter: blur(18px) saturate(140%);
      -webkit-backdrop-filter: blur(18px) saturate(140%);
      border-top: 1px solid var(--border-color);
      animation: slideUp 0.2s ease;

      ul {
        padding: 0.5rem 1rem 1rem;
        list-style: none;

        li a {
          display: block;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s ease;

          &:hover {
            background: var(--nav-pill);
            color: var(--text-primary);
          }
        }
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private watchlistService = inject(WatchlistService);
  private tmdb = inject(TmdbService);
  private router = inject(Router);

  isScrolled = signal(false);
  menuOpen = signal(false);
  searchOpen = signal(false);
  searchFocused = signal(false);
  suggestions = signal<SearchResult[]>([]);
  searchQuery = '';

  private searchSubject = new Subject<string>();
  private subscription = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => {
      if (query.length < 3) return of({ results: [] as SearchResult[] });
      return this.tmdb.searchMulti(query, 1);
    })
  ).subscribe(res => {
    this.suggestions.set((res as any).results?.slice(0, 6) || []);
  });

  isDark = computed(() => this.themeService.isDark());
  watchlistCount = computed(() => this.watchlistService.totalCount());

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleSearch(): void {
    this.searchOpen.update(v => !v);
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.searchFocused.set(false);
    }, 200);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.suggestions.set([]);
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim().length > 0) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.suggestions.set([]);
      this.searchFocused.set(false);
      this.searchOpen.set(false);
    }
  }

  getSuggestionLink(item: SearchResult): string[] {
    if (item.media_type === 'tv') return ['/tv', String(item.id)];
    if (item.media_type === 'person') return ['/person', String(item.id)];
    return ['/movies', String(item.id)];
  }

  navigateToSuggestion(item: SearchResult): void {
    const link = this.getSuggestionLink(item);
    this.router.navigate(link);
    this.suggestions.set([]);
    this.searchFocused.set(false);
    this.clearSearch();
  }
}
