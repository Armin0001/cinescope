import { Component, input, output, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../../core/services/tmdb.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { RatingCircleComponent } from '../rating-circle/rating-circle.component';
import { Movie, TVShow, SearchResult, MediaType } from '../../../core/models/tmdb.models';

export interface MediaCardItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  genre_ids?: number[];
  media_type?: MediaType;
}

@Component({
  selector: 'app-media-card',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingCircleComponent],
  template: `
    <div class="media-card" [routerLink]="detailLink()">
      <div class="poster-wrapper">
        <img
          [src]="posterUrl()"
          [alt]="title()"
          loading="lazy"
          class="poster"
          (error)="onImgError($event)"
        />
        <div class="overlay">
          <p class="overview line-clamp-3">{{ item().overview || 'No overview available.' }}</p>
          <button
            class="watchlist-btn"
            (click)="onWatchlistClick($event)"
            [class.in-list]="isInWatchlist()"
          >
            {{ isInWatchlist() ? '✓ In Watchlist' : '+ Watchlist' }}
          </button>
        </div>
        <div class="type-badge" [class]="typeBadgeClass()">
          {{ mediaTypeLabel() }}
        </div>
        <div class="rating-badge">
          <app-rating-circle [rating]="item().vote_average || 0" size="sm" />
        </div>
      </div>
      <div class="card-info">
        <h3 class="card-title truncate">{{ title() }}</h3>
        <span class="card-year">{{ year() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .media-card {
      cursor: pointer;
      transition: transform 0.3s ease;

      &:hover {
        .poster { filter: brightness(0.5); }
        .overlay { opacity: 1; }
      }
    }

    .poster-wrapper {
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      background: var(--bg-tertiary);
      aspect-ratio: 2/3;
    }

    .poster {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: filter 0.3s ease;
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0.75rem;
      gap: 0.5rem;
    }

    .overview {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.85);
      line-height: 1.5;
    }

    .watchlist-btn {
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
      background: var(--accent-color);
      color: white;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      align-self: flex-start;

      &:hover {
        background: var(--accent-hover);
      }

      &.in-list {
        background: rgba(34, 197, 94, 0.9);
      }
    }

    .type-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &.badge-movie {
        background: rgba(59, 130, 246, 0.85);
        color: white;
      }
      &.badge-tv {
        background: rgba(34, 197, 94, 0.85);
        color: white;
      }
    }

    .rating-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(0,0,0,0.7);
      border-radius: 50%;
    }

    .card-info {
      padding: 0.5rem 0.25rem;
    }

    .card-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.2rem;
    }

    .card-year {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  `]
})
export class MediaCardComponent {
  item = input.required<MediaCardItem>();
  mediaType = input<MediaType>('movie');

  watchlistClicked = output<{ id: number; mediaType: MediaType }>();

  private tmdb = inject(TmdbService);
  private watchlistService = inject(WatchlistService);

  title = computed(() => this.item().title || this.item().name || 'Unknown');

  year = computed(() => {
    const date = this.item().release_date || this.item().first_air_date;
    return date ? new Date(date).getFullYear().toString() : '';
  });

  posterUrl = computed(() => this.tmdb.getPosterUrl(this.item().poster_path ?? null));

  effectiveMediaType = computed<MediaType>(() => {
    return (this.item().media_type as MediaType) || this.mediaType();
  });

  detailLink = computed(() => {
    const mt = this.effectiveMediaType();
    if (mt === 'tv') return `/tv/${this.item().id}`;
    if (mt === 'person') return `/person/${this.item().id}`;
    return `/movies/${this.item().id}`;
  });

  typeBadgeClass = computed(() => {
    const mt = this.effectiveMediaType();
    return mt === 'tv' ? 'badge-tv' : 'badge-movie';
  });

  mediaTypeLabel = computed(() => {
    const mt = this.effectiveMediaType();
    return mt === 'tv' ? 'TV' : mt === 'person' ? 'Person' : 'Movie';
  });

  isInWatchlist = computed(() =>
    this.watchlistService.isInWatchlist(this.item().id, this.effectiveMediaType())
  );

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder.svg';
  }

  onWatchlistClick(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    const item = this.item();
    const mt = this.effectiveMediaType();

    if (this.isInWatchlist()) {
      this.watchlistService.removeFromAllLists(item.id, mt);
    } else {
      this.watchlistService.addToList('wantToWatch', {
        id: item.id,
        mediaType: mt,
        title: this.title(),
        posterPath: item.poster_path ?? null,
        voteAverage: item.vote_average ?? 0,
        releaseDate: item.release_date || item.first_air_date || '',
        addedAt: new Date().toISOString()
      });
    }
    this.watchlistClicked.emit({ id: item.id, mediaType: mt });
  }
}
