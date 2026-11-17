import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TmdbService } from '../../core/services/tmdb.service';
import { MediaCardComponent } from '../../shared/components/media-card/media-card.component';
import { Person } from '../../core/models/tmdb.models';

@Component({
  selector: 'app-person',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaCardComponent],
  template: `
    @if (loading()) {
      <div class="loading-center" style="height:100vh">
        <div class="spinner"></div>
      </div>
    } @else if (person()) {
      <div class="person-page">
        <div class="container">
          <div class="person-layout">
            <!-- Left Sidebar -->
            <aside class="person-sidebar">
              <div class="profile-img-wrapper">
                <img
                  [src]="profileUrl()"
                  [alt]="person()!.name"
                  class="profile-img"
                  (error)="onImgError($event)"
                />
              </div>

              <div class="personal-info">
                <h2>Personal Info</h2>
                <div class="info-item">
                  <span class="info-label">Known For</span>
                  <span class="info-value">{{ person()!.known_for_department }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Gender</span>
                  <span class="info-value">{{ genderLabel() }}</span>
                </div>
                @if (person()!.birthday) {
                  <div class="info-item">
                    <span class="info-label">Birthday</span>
                    <span class="info-value">{{ person()!.birthday | date:'mediumDate' }}</span>
                  </div>
                }
                @if (person()!.deathday) {
                  <div class="info-item">
                    <span class="info-label">Died</span>
                    <span class="info-value">{{ person()!.deathday | date:'mediumDate' }}</span>
                  </div>
                }
                @if (person()!.place_of_birth) {
                  <div class="info-item">
                    <span class="info-label">Place of Birth</span>
                    <span class="info-value">{{ person()!.place_of_birth }}</span>
                  </div>
                }
                @if (person()!.also_known_as?.length) {
                  <div class="info-item">
                    <span class="info-label">Also Known As</span>
                    @for (alias of person()!.also_known_as!; track alias) {
                      <span class="info-value alias">{{ alias }}</span>
                    }
                  </div>
                }
              </div>
            </aside>

            <!-- Main Content -->
            <div class="person-main">
              <h1 class="person-name">{{ person()!.name }}</h1>

              @if (person()!.biography) {
                <section class="bio-section">
                  <h3>Biography</h3>
                  <p class="bio-text" [class.expanded]="bioExpanded()">{{ person()!.biography }}</p>
                  @if (person()!.biography!.length > 600) {
                    <button class="read-more-btn" (click)="toggleBio()">
                      {{ bioExpanded() ? 'Show Less' : 'Read More' }}
                    </button>
                  }
                </section>
              }

              <!-- Known For -->
              @if (knownForMovies().length > 0 || knownForTV().length > 0) {
                <section class="known-for-section">
                  <h3>Known For</h3>
                  <div class="horizontal-scroll known-for-scroll">
                    @for (item of knownForMovies().slice(0, 12); track item.id) {
                      <app-media-card [item]="item" mediaType="movie" />
                    }
                    @for (item of knownForTV().slice(0, 8); track item.id) {
                      <app-media-card [item]="item" mediaType="tv" />
                    }
                  </div>
                </section>
              }

              <!-- Filmography Tabs -->
              <section class="filmography-section">
                <div class="tabs">
                  <button class="tab" [class.active]="activeTab() === 'movies'" (click)="activeTab.set('movies')">
                    Movies ({{ movieCredits().length }})
                  </button>
                  <button class="tab" [class.active]="activeTab() === 'tv'" (click)="activeTab.set('tv')">
                    TV Shows ({{ tvCredits().length }})
                  </button>
                </div>

                @if (activeTab() === 'movies') {
                  <div class="filmography-list">
                    @for (credit of movieCredits(); track credit.credit_id) {
                      <a [routerLink]="['/movies', credit.id]" class="credit-item">
                        <img [src]="getPosterUrl(credit.poster_path)" [alt]="credit.title" (error)="onImgError($event)" />
                        <div class="credit-info">
                          <p class="credit-title">{{ credit.title }}</p>
                          <p class="credit-role">{{ credit.character || credit.job }}</p>
                          <p class="credit-year">{{ credit.release_date?.slice(0, 4) }}</p>
                        </div>
                      </a>
                    }
                  </div>
                } @else {
                  <div class="filmography-list">
                    @for (credit of tvCredits(); track credit.credit_id) {
                      <a [routerLink]="['/tv', credit.id]" class="credit-item">
                        <img [src]="getPosterUrl(credit.poster_path)" [alt]="credit.name" (error)="onImgError($event)" />
                        <div class="credit-info">
                          <p class="credit-title">{{ credit.name }}</p>
                          <p class="credit-role">{{ credit.character || credit.job }}</p>
                          <p class="credit-year">{{ credit.first_air_date?.slice(0, 4) }}</p>
                        </div>
                      </a>
                    }
                  </div>
                }
              </section>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="empty-state" style="height:60vh">
        <div class="empty-icon">👤</div>
        <h3>Person not found</h3>
      </div>
    }
  `,
  styles: [`
    .person-page {
      padding: 3rem 0;
      min-height: 100vh;
    }

    .person-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;

      @media (min-width: 768px) {
        grid-template-columns: 280px 1fr;
      }
    }

    .profile-img-wrapper {
      margin-bottom: 1.5rem;
    }

    .profile-img {
      width: 100%;
      max-width: 280px;
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      background: var(--bg-tertiary);

      @media (max-width: 768px) {
        max-width: 180px;
        display: block;
        margin: 0 auto;
      }
    }

    .personal-info {
      h2 {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color);
      }
    }

    .info-item {
      margin-bottom: 1rem;

      .info-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        margin-bottom: 0.25rem;
      }

      .info-value {
        display: block;
        font-size: 0.875rem;
        color: var(--text-primary);

        &.alias {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }
      }
    }

    .person-name {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 900;
      margin-bottom: 1.5rem;
    }

    .bio-section {
      margin-bottom: 2rem;

      h3 { margin-bottom: 1rem; }
    }

    .bio-text {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      line-height: 1.8;
      max-height: 200px;
      overflow: hidden;
      transition: max-height 0.3s ease;

      &.expanded { max-height: none; }
    }

    .read-more-btn {
      background: none;
      border: none;
      color: var(--accent-color);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      margin-top: 0.5rem;
      padding: 0;
      font-family: inherit;

      &:hover { text-decoration: underline; }
    }

    .known-for-section {
      margin-bottom: 2.5rem;

      h3 { margin-bottom: 1rem; }
    }

    .known-for-scroll {
      > * { width: 140px !important; }
    }

    .filmography-section {
      h3 { margin-bottom: 1rem; }
    }

    .filmography-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .credit-item {
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

      img {
        width: 50px;
        height: 75px;
        object-fit: cover;
        border-radius: 4px;
        background: var(--bg-tertiary);
        flex-shrink: 0;
      }
    }

    .credit-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; }
    .credit-role { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
    .credit-year { font-size: 0.75rem; color: var(--text-muted); }
  `]
})
export class PersonComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tmdb = inject(TmdbService);

  person = signal<Person | null>(null);
  movieCredits = signal<any[]>([]);
  tvCredits = signal<any[]>([]);
  loading = signal(true);
  activeTab = signal<'movies' | 'tv'>('movies');
  bioExpanded = signal(false);

  profileUrl = () => this.tmdb.getProfileUrl(this.person()?.profile_path ?? null);

  genderLabel = () => {
    switch (this.person()?.gender) {
      case 1: return 'Female';
      case 2: return 'Male';
      case 3: return 'Non-binary';
      default: return 'Not specified';
    }
  };

  knownForMovies = () => this.movieCredits()
    .filter(m => m.vote_count > 100)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10);

  knownForTV = () => this.tvCredits()
    .filter(t => t.vote_count > 50)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.loadData(id);
    });
  }

  loadData(id: number): void {
    this.loading.set(true);
    forkJoin({
      person: this.tmdb.getPersonDetails(id),
      movieCredits: this.tmdb.getPersonMovieCredits(id),
      tvCredits: this.tmdb.getPersonTVCredits(id)
    }).subscribe({
      next: (data) => {
        this.person.set(data.person);
        const allMovies = [...data.movieCredits.cast, ...data.movieCredits.crew]
          .sort((a, b) => new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime());
        const uniqueMovies = allMovies.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);
        this.movieCredits.set(uniqueMovies);

        const allTV = [...data.tvCredits.cast, ...data.tvCredits.crew]
          .sort((a, b) => new Date(b.first_air_date || '').getTime() - new Date(a.first_air_date || '').getTime());
        const uniqueTV = allTV.filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);
        this.tvCredits.set(uniqueTV);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleBio(): void {
    this.bioExpanded.update(v => !v);
  }

  getPosterUrl(path: string | null): string {
    return this.tmdb.getPosterUrl(path);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'placeholder.svg';
  }
}
