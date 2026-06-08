import { Component, input, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../../core/services/tmdb.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { RatingCircleComponent } from '../rating-circle/rating-circle.component';
import { GenreBadgeComponent } from '../genre-badge/genre-badge.component';
import { Movie, TVShow, Genre, MediaType } from '../../../core/models/tmdb.models';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingCircleComponent, GenreBadgeComponent],
  template: `
    <div class="hero-banner" [style.backgroundImage]="backdropStyle()">
      <div class="hero-overlay">
        <div class="container hero-content">
          <div class="hero-badge">
            <span class="trending-label">Trending</span>
          </div>
          <h1 class="hero-title">{{ title() }}</h1>
          <div class="hero-meta">
            <app-rating-circle [rating]="rating()" size="md" />
            <span class="meta-dot">•</span>
            <span class="release-year">{{ year() }}</span>
            @if (runtime()) {
              <span class="meta-dot">•</span>
              <span>{{ runtime() }}m</span>
            }
          </div>
          <div class="hero-genres">
            @for (genre of genres(); track genre.id) {
              <app-genre-badge [name]="genre.name" />
            }
          </div>
          <p class="hero-overview line-clamp-3">{{ overview() }}</p>
          <div class="hero-actions">
            <a [routerLink]="detailLink()" class="btn btn-primary">
              <span>▶</span> View Details
            </a>
            <button class="btn btn-secondary" (click)="addToWatchlist()">
              @if (inWatchlist()) {
                <span>✓</span> In Watchlist
              } @else {
                <span>+</span> Add to Watchlist
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .hero-banner {
      position: relative;
      height: 85vh;
      min-height: 500px;
      max-height: 800px;
      background-size: cover;
      background-position: center top;
      background-color: var(--bg-secondary);
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to right,
        rgba(10,10,10,0.98) 0%,
        rgba(10,10,10,0.85) 40%,
        rgba(10,10,10,0.4) 70%,
        transparent 100%
      );
      display: flex;
      align-items: flex-end;
      padding-bottom: 4rem;
    }

    .hero-content {
      max-width: 650px;
      animation: slideUp 0.6s ease forwards;
    }

    .hero-badge {
      margin-bottom: 1rem;
    }

    .trending-label {
      background: var(--accent-color);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .hero-title {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 900;
      color: white;
      line-height: 1.1;
      margin-bottom: 1rem;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }

    .hero-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      color: rgba(255,255,255,0.8);
      font-size: 0.875rem;
    }

    .meta-dot {
      opacity: 0.5;
    }

    .hero-genres {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .hero-overview {
      font-size: 0.9375rem;
      color: rgba(255,255,255,0.8);
      line-height: 1.7;
      margin-bottom: 1.5rem;
      max-width: 560px;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .hero-overlay {
        background: linear-gradient(
          to top,
          rgba(10,10,10,1) 0%,
          rgba(10,10,10,0.8) 50%,
          rgba(10,10,10,0.3) 100%
        );
        align-items: flex-end;
        padding-bottom: 2rem;
      }

      .hero-banner {
        height: 70vh;
      }
    }
  `]
})
export class HeroBannerComponent {
  media = input.required<Movie | TVShow>();
  mediaType = input<MediaType>('movie');

  private tmdb = inject(TmdbService);
  private watchlistService = inject(WatchlistService);

  title = computed(() => {
    const m = this.media() as any;
    return m.title || m.name || 'Unknown';
  });

  year = computed(() => {
    const m = this.media() as any;
    const date = m.release_date || m.first_air_date;
    return date ? new Date(date).getFullYear().toString() : '';
  });

  overview = computed(() => this.media().overview || '');
  rating = computed(() => this.media().vote_average || 0);

  genres = computed(() => {
    const m = this.media() as any;
    return (m.genres as Genre[]) || [];
  });

  runtime = computed(() => {
    const m = this.media() as any;
    return m.runtime || null;
  });

  backdropStyle = computed(() => {
    const url = this.tmdb.getBackdropUrl(this.media().backdrop_path);
    return `url('${url}')`;
  });

  detailLink = computed(() => {
    const mt = this.mediaType();
    return mt === 'tv' ? `/tv/${this.media().id}` : `/movies/${this.media().id}`;
  });

  inWatchlist = computed(() =>
    this.watchlistService.isInWatchlist(this.media().id, this.mediaType())
  );

  addToWatchlist(): void {
    const m = this.media() as any;
    if (this.inWatchlist()) {
      this.watchlistService.removeFromAllLists(m.id, this.mediaType());
    } else {
      this.watchlistService.addToList('wantToWatch', {
        id: m.id,
        mediaType: this.mediaType(),
        title: this.title(),
        posterPath: m.poster_path ?? null,
        voteAverage: m.vote_average ?? 0,
        releaseDate: m.release_date || m.first_air_date || '',
        addedAt: new Date().toISOString()
      });
    }
  }
}
