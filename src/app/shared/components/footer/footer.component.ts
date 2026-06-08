import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <a routerLink="/" class="footer-logo">
            <span class="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z"/>
              </svg>
            </span>
            <span>Cine<b>Scope</b></span>
          </a>
          <p>Discover movies and TV shows powered by The Movie Database.</p>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4>Browse</h4>
            <ul>
              <li><a routerLink="/movies">Movies</a></li>
              <li><a routerLink="/tv">TV Shows</a></li>
              <li><a routerLink="/trending">Trending</a></li>
              <li><a routerLink="/discover">Discover</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>Account</h4>
            <ul>
              <li><a routerLink="/watchlist">Watchlist</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- TMDB Attribution (required by API Terms of Use) -->
      <div class="footer-attribution">
        <div class="container">
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" class="tmdb-logo-link" aria-label="The Movie Database">
            <img src="tmdb-logo.svg" alt="The Movie Database (TMDB)" class="tmdb-logo" />
          </a>
          <p>
            This product uses the TMDB API but is not endorsed, certified, or otherwise approved by TMDB.
            Data provided by <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">The Movie Database (TMDB)</a>.
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container">
          <p>&copy; {{ currentYear }} CineScope. Built with Angular 18.</p>
          <p>For non-commercial use only.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
      margin-top: 4rem;
    }

    .footer-inner {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      padding-top: 3rem;
      padding-bottom: 2rem;

      @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
      }
    }

    .footer-brand {
      .footer-logo {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary);
        text-decoration: none;
        margin-bottom: 0.75rem;

        .logo-mark {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: grid;
          place-items: center;
          background: linear-gradient(145deg, var(--accent-hover), var(--accent-dark));
          box-shadow: 0 3px 10px rgba(229, 9, 20, 0.35);
          flex-shrink: 0;
          svg { width: 14px; height: 14px; color: #fff; }
        }

        b { color: var(--accent-color); }
      }

      p {
        font-size: 0.875rem;
        color: var(--text-muted);
      }
    }

    .footer-links {
      display: flex;
      gap: 2rem;
    }

    .link-group {
      h4 {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      ul {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        list-style: none;

        li a {
          font-size: 0.875rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;

          &:hover { color: var(--text-primary); }
        }
      }
    }

    /* TMDB required attribution block */
    .footer-attribution {
      border-top: 1px solid var(--border-color);
      padding: 1.5rem 0;
      background: var(--bg-tertiary);

      .container {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        flex-wrap: wrap;
      }

      .tmdb-logo-link {
        flex-shrink: 0;
        opacity: 0.85;
        transition: opacity 0.2s ease;
        &:hover { opacity: 1; }
      }

      .tmdb-logo {
        height: 20px;
        width: auto;
        display: block;
      }

      p {
        font-size: 0.75rem;
        color: var(--text-muted);
        line-height: 1.5;

        a {
          color: var(--text-secondary);
          text-decoration: underline;
          text-underline-offset: 2px;
          &:hover { color: var(--text-primary); }
        }
      }
    }

    .footer-bottom {
      border-top: 1px solid var(--border-color);
      padding: 1.25rem 0;

      .container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        @media (min-width: 768px) {
          flex-direction: row;
          justify-content: space-between;
        }
      }

      p {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
