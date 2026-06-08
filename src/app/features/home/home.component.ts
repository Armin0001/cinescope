import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TmdbService } from '../../core/services/tmdb.service';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { MediaCardComponent } from '../../shared/components/media-card/media-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';
import { Movie, TVShow } from '../../core/models/tmdb.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroBannerComponent, MediaCardComponent, SkeletonCardComponent],
  template: `
    <!-- Hero Banner -->
    @if (featuredMovie()) {
      <app-hero-banner [media]="featuredMovie()!" mediaType="movie" />
    } @else {
      <div class="hero-skeleton skeleton"></div>
    }

    <div class="container home-sections">
      <!-- Trending Today -->
      <section class="home-section">
        <div class="section-header">
          <h2>Trending Today</h2>
          <a routerLink="/trending">View All</a>
        </div>
        <div class="horizontal-scroll">
          @if (loading()) {
            @for (i of skeletons; track i) {
              <app-skeleton-card />
            }
          } @else {
            @for (item of trendingDay(); track item.id) {
              <app-media-card [item]="item" />
            }
          }
        </div>
      </section>

      <!-- Trending This Week -->
      <section class="home-section">
        <div class="section-header">
          <h2>Trending This Week</h2>
          <a routerLink="/trending">View All</a>
        </div>
        <div class="horizontal-scroll">
          @if (loading()) {
            @for (i of skeletons; track i) {
              <app-skeleton-card />
            }
          } @else {
            @for (item of trendingWeek(); track item.id) {
              <app-media-card [item]="item" />
            }
          }
        </div>
      </section>

      <!-- Popular Movies -->
      <section class="home-section">
        <div class="section-header">
          <h2>Popular Movies</h2>
          <a routerLink="/movies">View All</a>
        </div>
        <div class="horizontal-scroll">
          @if (loading()) {
            @for (i of skeletons; track i) {
              <app-skeleton-card />
            }
          } @else {
            @for (movie of popularMovies(); track movie.id) {
              <app-media-card [item]="movie" mediaType="movie" />
            }
          }
        </div>
      </section>

      <!-- Popular TV Shows -->
      <section class="home-section">
        <div class="section-header">
          <h2>Popular TV Shows</h2>
          <a routerLink="/tv">View All</a>
        </div>
        <div class="horizontal-scroll">
          @if (loading()) {
            @for (i of skeletons; track i) {
              <app-skeleton-card />
            }
          } @else {
            @for (show of popularTV(); track show.id) {
              <app-media-card [item]="show" mediaType="tv" />
            }
          }
        </div>
      </section>

      <!-- Top Rated Movies -->
      <section class="home-section">
        <div class="section-header">
          <h2>Top Rated Movies</h2>
          <a routerLink="/movies">View All</a>
        </div>
        <div class="horizontal-scroll">
          @if (loading()) {
            @for (i of skeletons; track i) {
              <app-skeleton-card />
            }
          } @else {
            @for (movie of topRatedMovies(); track movie.id) {
              <app-media-card [item]="movie" mediaType="movie" />
            }
          }
        </div>
      </section>

      <!-- Now Playing -->
      <section class="home-section">
        <div class="section-header">
          <h2>Now Playing</h2>
          <a routerLink="/movies">View All</a>
        </div>
        <div class="horizontal-scroll">
          @if (loading()) {
            @for (i of skeletons; track i) {
              <app-skeleton-card />
            }
          } @else {
            @for (movie of nowPlaying(); track movie.id) {
              <app-media-card [item]="movie" mediaType="movie" />
            }
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .hero-skeleton {
      height: 85vh;
      min-height: 500px;
      max-height: 800px;
      width: 100%;
    }

    .home-sections {
      padding-top: 3rem;
      padding-bottom: 3rem;
    }

    .home-section {
      margin-bottom: 3rem;
    }
  `]
})
export class HomeComponent implements OnInit {
  private tmdb = inject(TmdbService);

  loading = signal(true);
  featuredMovie = signal<Movie | null>(null);
  trendingDay = signal<any[]>([]);
  trendingWeek = signal<any[]>([]);
  popularMovies = signal<Movie[]>([]);
  popularTV = signal<TVShow[]>([]);
  topRatedMovies = signal<Movie[]>([]);
  nowPlaying = signal<Movie[]>([]);

  skeletons = Array(10).fill(0);

  ngOnInit(): void {
    forkJoin({
      trendingDay: this.tmdb.getTrending('all', 'day'),
      trendingWeek: this.tmdb.getTrending('all', 'week'),
      popularMovies: this.tmdb.getPopularMovies(),
      popularTV: this.tmdb.getPopularTVShows(),
      topRated: this.tmdb.getTopRated('movie'),
      nowPlaying: this.tmdb.getNowPlaying()
    }).subscribe({
      next: (data) => {
        const trending = data.trendingDay.results;
        const featured = trending.find((r: any) => r.backdrop_path && r.media_type === 'movie') as Movie;
        this.featuredMovie.set(featured || null);

        this.trendingDay.set(trending.slice(0, 15).map((r: any) => ({
          ...r,
          media_type: r.media_type || 'movie'
        })));

        this.trendingWeek.set(data.trendingWeek.results.slice(0, 15).map((r: any) => ({
          ...r,
          media_type: r.media_type || 'movie'
        })));

        this.popularMovies.set(data.popularMovies.results.slice(0, 15));
        this.popularTV.set(data.popularTV.results.slice(0, 15));
        this.topRatedMovies.set((data.topRated.results as Movie[]).slice(0, 15));
        this.nowPlaying.set(data.nowPlaying.results.slice(0, 15));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
