import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TmdbService } from '../../core/services/tmdb.service';
import { WatchlistService, WatchlistCategory } from '../../core/services/watchlist.service';
import { RatingCircleComponent } from '../../shared/components/rating-circle/rating-circle.component';
import { GenreBadgeComponent } from '../../shared/components/genre-badge/genre-badge.component';
import { MediaCardComponent } from '../../shared/components/media-card/media-card.component';
import { Movie, Cast, Crew, Video, Review, WatchProviderResult } from '../../core/models/tmdb.models';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingCircleComponent, GenreBadgeComponent, MediaCardComponent],
  template: `
    @if (loading()) {
      <div class="loading-center" style="height:100vh">
        <div class="spinner"></div>
      </div>
    } @else if (movie()) {
      <!-- Hero Section -->
      <div class="detail-hero" [style.backgroundImage]="'url(' + backdropUrl() + ')'">
        <div class="hero-overlay">
          <div class="container hero-content">
            <div class="poster-section">
              <img [src]="posterUrl()" [alt]="movie()!.title" class="detail-poster" (error)="onImgError($event)" />
            </div>
            <div class="info-section">
              <h1 class="movie-title">{{ movie()!.title }}</h1>
              @if (movie()!.tagline) {
                <p class="tagline">{{ movie()!.tagline }}</p>
              }
              <div class="meta-row">
                <app-rating-circle [rating]="movie()!.vote_average" size="lg" />
                <div class="meta-details">
                  <span class="year">{{ releaseYear() }}</span>
                  @if (movie()!.runtime) {
                    <span class="dot">•</span>
                    <span>{{ formatRuntime(movie()!.runtime!) }}</span>
                  }
                  <span class="dot">•</span>
                  <span class="lang">{{ (movie()!.original_language || '').toUpperCase() }}</span>
                </div>
              </div>
              <div class="genres">
                @for (genre of movie()!.genres || []; track genre.id) {
                  <app-genre-badge [name]="genre.name" />
                }
              </div>
              <p class="overview">{{ movie()!.overview }}</p>
              <div class="action-buttons">
                <div class="watchlist-wrapper">
                  <button class="btn btn-primary" (click)="toggleWatchlistMenu()">
                    {{ currentCategory() ? '✓ In Watchlist' : '+ Add to Watchlist' }}
                    <span class="dropdown-arrow">▾</span>
                  </button>
                  @if (watchlistMenuOpen()) {
                    <div class="watchlist-dropdown">
                      @for (cat of watchlistCategories; track cat.value) {
                        <button
                          class="dropdown-item"
                          [class.active]="currentCategory() === cat.value"
                          (click)="addToWatchlist(cat.value)"
                        >
                          {{ cat.label }}
                        </button>
                      }
                      @if (currentCategory()) {
                        <button class="dropdown-item remove" (click)="removeFromWatchlist()">
                          Remove from Watchlist
                        </button>
                      }
                    </div>
                  }
                </div>
                @if (trailer()) {
                  <a [href]="'https://youtube.com/watch?v=' + trailer()!.key" target="_blank" class="btn btn-secondary">
                    ▶ Watch Trailer
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Content -->
      <div class="container detail-body">
        <div class="tabs">
          @for (tab of tabs; track tab) {
            <button class="tab" [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">
              {{ tab }}
            </button>
          }
        </div>

        @switch (activeTab()) {
          @case ('Overview') {
            <div class="overview-tab">
              <div class="overview-grid">
                <div class="overview-main">
                  <h3>Story</h3>
                  <p>{{ movie()!.overview }}</p>

                  @if (watchProviders()) {
                    <div class="providers-section">
                      <h3>Where to Watch</h3>
                      @if (watchProviders()!.flatrate?.length) {
                        <div class="provider-row">
                          <span class="provider-label">Stream</span>
                          @for (p of watchProviders()!.flatrate!; track p.provider_id) {
                            <img [src]="'https://image.tmdb.org/t/p/w45' + p.logo_path" [title]="p.provider_name" class="provider-logo" />
                          }
                        </div>
                      }
                      @if (watchProviders()!.rent?.length) {
                        <div class="provider-row">
                          <span class="provider-label">Rent</span>
                          @for (p of watchProviders()!.rent!; track p.provider_id) {
                            <img [src]="'https://image.tmdb.org/t/p/w45' + p.logo_path" [title]="p.provider_name" class="provider-logo" />
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
                <div class="overview-aside">
                  <div class="info-item" *ngIf="movie()!.status">
                    <span class="info-label">Status</span>
                    <span class="info-value">{{ movie()!.status }}</span>
                  </div>
                  <div class="info-item" *ngIf="movie()!.release_date">
                    <span class="info-label">Release Date</span>
                    <span class="info-value">{{ movie()!.release_date | date:'mediumDate' }}</span>
                  </div>
                  <div class="info-item" *ngIf="movie()!.budget">
                    <span class="info-label">Budget</span>
                    <span class="info-value">{{ movie()!.budget | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="info-item" *ngIf="movie()!.revenue">
                    <span class="info-label">Revenue</span>
                    <span class="info-value">{{ movie()!.revenue | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                  @if (movie()!.production_companies?.length) {
                    <div class="info-item">
                      <span class="info-label">Production</span>
                      <span class="info-value">{{ productionCompaniesNames() }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
          @case ('Cast') {
            <div class="cast-grid">
              @for (person of cast(); track person.id) {
                <a [routerLink]="['/person', person.id]" class="cast-card">
                  <img [src]="getProfileUrl(person.profile_path)" [alt]="person.name" (error)="onImgError($event)" />
                  <div class="cast-info">
                    <p class="cast-name">{{ person.name }}</p>
                    <p class="cast-character">{{ person.character }}</p>
                  </div>
                </a>
              }
            </div>
          }
          @case ('Crew') {
            <div class="crew-list">
              @for (person of crew(); track person.credit_id) {
                <a [routerLink]="['/person', person.id]" class="crew-item">
                  <img [src]="getProfileUrl(person.profile_path)" [alt]="person.name" (error)="onImgError($event)" />
                  <div>
                    <p class="crew-name">{{ person.name }}</p>
                    <p class="crew-job">{{ person.job }}</p>
                  </div>
                </a>
              }
            </div>
          }
          @case ('Videos') {
            <div class="videos-grid">
              @for (video of videos(); track video.id) {
                <div class="video-card">
                  <a [href]="'https://youtube.com/watch?v=' + video.key" target="_blank" class="video-thumb">
                    <img [src]="'https://img.youtube.com/vi/' + video.key + '/mqdefault.jpg'" [alt]="video.name" />
                    <div class="play-btn">▶</div>
                  </a>
                  <p class="video-name">{{ video.name }}</p>
                  <p class="video-type">{{ video.type }}</p>
                </div>
              }
            </div>
          }
          @case ('Images') {
            <div class="images-grid">
              @for (image of images(); track image.file_path) {
                <a [href]="'https://image.tmdb.org/t/p/original' + image.file_path" target="_blank">
                  <img [src]="'https://image.tmdb.org/t/p/w500' + image.file_path" alt="Movie image" loading="lazy" />
                </a>
              }
            </div>
          }
          @case ('Reviews') {
            <div class="reviews-list">
              @if (reviews().length === 0) {
                <div class="empty-state">
                  <div class="empty-icon">💬</div>
                  <h3>No reviews yet</h3>
                </div>
              }
              @for (review of reviews(); track review.id) {
                <div class="review-card">
                  <div class="review-header">
                    <div class="reviewer">
                      <div class="reviewer-avatar">{{ (review.author[0] || '').toUpperCase() }}</div>
                      <div>
                        <p class="reviewer-name">{{ review.author }}</p>
                        <p class="review-date">{{ review.created_at | date:'mediumDate' }}</p>
                      </div>
                    </div>
                    @if (review.author_details.rating) {
                      <span class="review-rating">⭐ {{ review.author_details.rating }}/10</span>
                    }
                  </div>
                  <p class="review-content">{{ review.content }}</p>
                </div>
              }
            </div>
          }
          @case ('Similar') {
            <div class="media-grid">
              @for (movie of similar(); track movie.id) {
                <app-media-card [item]="movie" mediaType="movie" />
              }
            </div>
          }
        }
      </div>
    } @else {
      <div class="empty-state" style="height:60vh">
        <div class="empty-icon">🎬</div>
        <h3>Movie not found</h3>
      </div>
    }
  `,
  styles: [`
    .detail-hero {
      background-size: cover;
      background-position: center;
      min-height: 550px;
      position: relative;
    }

    .hero-overlay {
      background: linear-gradient(to right, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.85) 50%, rgba(10,10,10,0.6) 100%);
      min-height: 550px;
      display: flex;
      align-items: center;
      padding: 3rem 0;
    }

    .hero-content {
      display: flex;
      gap: 2.5rem;
      align-items: flex-start;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }

    .detail-poster {
      width: 220px;
      min-width: 220px;
      border-radius: 12px;
      box-shadow: var(--shadow-lg);

      @media (max-width: 768px) {
        width: 160px;
        min-width: 160px;
      }
    }

    .info-section { flex: 1; }

    .movie-title {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 900;
      margin-bottom: 0.5rem;
    }

    .tagline {
      font-style: italic;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .meta-details {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .dot { opacity: 0.5; }
    .genres { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }

    .overview {
      color: rgba(255,255,255,0.8);
      line-height: 1.7;
      margin-bottom: 1.5rem;
      max-width: 600px;
    }

    .action-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }

    .watchlist-wrapper { position: relative; }

    .watchlist-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      z-index: 50;
      min-width: 200px;
      box-shadow: var(--shadow-lg);
      margin-top: 0.25rem;
    }

    .dropdown-item {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: var(--text-primary);
      text-align: left;
      cursor: pointer;
      background: none;
      border: none;
      transition: background 0.2s ease;
      font-family: inherit;

      &:hover { background: var(--bg-tertiary); }
      &.active { color: var(--accent-color); }
      &.remove { color: #ef4444; border-top: 1px solid var(--border-color); }
    }

    .dropdown-arrow { margin-left: 0.25rem; }

    .detail-body { padding: 2rem 0 4rem; }

    .overview-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;

      @media (min-width: 768px) {
        grid-template-columns: 1fr 280px;
      }
    }

    .overview-main { h3 { margin-bottom: 1rem; } }
    .overview-aside {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1.5rem;
      height: fit-content;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child { border-bottom: none; }
    }

    .info-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
    .info-value { font-size: 0.9rem; color: var(--text-primary); }

    .providers-section { margin-top: 2rem; h3 { margin-bottom: 1rem; } }
    .provider-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .provider-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; min-width: 40px; }
    .provider-logo { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }

    .cast-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;

      @media (min-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      }
    }

    .cast-card {
      text-align: center;
      text-decoration: none;
      transition: transform 0.2s ease;

      &:hover { transform: translateY(-3px); }

      img {
        width: 100%;
        aspect-ratio: 2/3;
        object-fit: cover;
        border-radius: 8px;
        background: var(--bg-tertiary);
      }
    }

    .cast-info { padding: 0.5rem 0; }
    .cast-name { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
    .cast-character { font-size: 0.75rem; color: var(--text-muted); }

    .crew-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .crew-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s ease;

      &:hover { background: var(--card-hover-bg); }

      img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: var(--bg-tertiary); }
    }

    .crew-name { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
    .crew-job { font-size: 0.75rem; color: var(--text-muted); }

    .videos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .video-thumb {
      position: relative;
      display: block;
      border-radius: 8px;
      overflow: hidden;
      aspect-ratio: 16/9;

      img { width: 100%; height: 100%; object-fit: cover; transition: filter 0.2s ease; }

      &:hover img { filter: brightness(0.7); }
      &:hover .play-btn { transform: translate(-50%, -50%) scale(1.1); }
    }

    .play-btn {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 48px;
      height: 48px;
      background: rgba(229,9,20,0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1rem;
      transition: transform 0.2s ease;
    }

    .video-name { font-size: 0.875rem; font-weight: 600; margin-top: 0.5rem; }
    .video-type { font-size: 0.75rem; color: var(--text-muted); }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;

      img { width: 100%; border-radius: 6px; aspect-ratio: 16/9; object-fit: cover; transition: opacity 0.2s ease; &:hover { opacity: 0.8; } }
    }

    .reviews-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .review-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1.5rem;
    }

    .review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
    .reviewer { display: flex; align-items: center; gap: 1rem; }
    .reviewer-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--accent-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.125rem;
      color: white;
    }
    .reviewer-name { font-weight: 600; font-size: 0.9rem; }
    .review-date { font-size: 0.75rem; color: var(--text-muted); }
    .review-rating { font-weight: 600; font-size: 0.875rem; color: var(--warning-color); }
    .review-content { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.7; white-space: pre-wrap; }
  `]
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tmdb = inject(TmdbService);
  private watchlistService = inject(WatchlistService);

  movie = signal<Movie | null>(null);
  cast = signal<Cast[]>([]);
  crew = signal<Crew[]>([]);
  videos = signal<Video[]>([]);
  images = signal<any[]>([]);
  reviews = signal<Review[]>([]);
  similar = signal<Movie[]>([]);
  watchProviders = signal<WatchProviderResult | null>(null);
  loading = signal(true);
  activeTab = signal('Overview');
  watchlistMenuOpen = signal(false);

  tabs = ['Overview', 'Cast', 'Crew', 'Videos', 'Images', 'Reviews', 'Similar'];

  watchlistCategories = [
    { value: 'wantToWatch' as WatchlistCategory, label: '📋 Want to Watch' },
    { value: 'watching' as WatchlistCategory, label: '▶️ Watching' },
    { value: 'completed' as WatchlistCategory, label: '✅ Completed' },
    { value: 'favorites' as WatchlistCategory, label: '❤️ Favorites' }
  ];

  get currentCategory() {
    return () => {
      const m = this.movie();
      if (!m) return null;
      return this.watchlistService.getItemCategory(m.id, 'movie');
    };
  }

  trailer = () => this.videos().find(v => v.type === 'Trailer' && v.site === 'YouTube');
  backdropUrl = () => this.tmdb.getBackdropUrl(this.movie()?.backdrop_path ?? null);
  posterUrl = () => this.tmdb.getPosterUrl(this.movie()?.poster_path ?? null);
  releaseYear = () => this.movie()?.release_date ? new Date(this.movie()!.release_date).getFullYear() : '';
  productionCompaniesNames = () => (this.movie()?.production_companies || []).map(c => c.name).join(', ');

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.loadData(id);
    });
  }

  loadData(id: number): void {
    this.loading.set(true);
    forkJoin({
      movie: this.tmdb.getMovieDetails(id),
      credits: this.tmdb.getMovieCredits(id),
      videos: this.tmdb.getMovieVideos(id),
      images: this.tmdb.getMovieImages(id),
      reviews: this.tmdb.getMovieReviews(id),
      similar: this.tmdb.getSimilarMovies(id),
      providers: this.tmdb.getWatchProviders(id, 'movie')
    }).subscribe({
      next: (data) => {
        this.movie.set(data.movie);
        this.cast.set(data.credits.cast.slice(0, 20));
        this.crew.set(data.credits.crew.slice(0, 30));
        this.videos.set(data.videos.results.filter(v => v.site === 'YouTube'));
        this.images.set(data.images.backdrops.slice(0, 20));
        this.reviews.set(data.reviews.results);
        this.similar.set(data.similar.results.slice(0, 12));
        const providersUS = data.providers.results['US'];
        this.watchProviders.set(providersUS || null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatRuntime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  getProfileUrl(path: string | null): string {
    return this.tmdb.getProfileUrl(path);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder.svg';
  }

  toggleWatchlistMenu(): void {
    this.watchlistMenuOpen.update(v => !v);
  }

  addToWatchlist(category: WatchlistCategory): void {
    const m = this.movie();
    if (!m) return;
    this.watchlistService.addToList(category, {
      id: m.id,
      mediaType: 'movie',
      title: m.title,
      posterPath: m.poster_path,
      voteAverage: m.vote_average,
      releaseDate: m.release_date,
      addedAt: new Date().toISOString()
    });
    this.watchlistMenuOpen.set(false);
  }

  removeFromWatchlist(): void {
    const m = this.movie();
    if (!m) return;
    this.watchlistService.removeFromAllLists(m.id, 'movie');
    this.watchlistMenuOpen.set(false);
  }
}
