import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    <div class="skeleton-card">
      <div class="skeleton poster-skeleton"></div>
      <div class="info">
        <div class="skeleton title-skeleton"></div>
        <div class="skeleton meta-skeleton"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: var(--card-bg);
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border-color);

      .poster-skeleton {
        width: 100%;
        padding-top: 150%;
      }

      .info {
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .title-skeleton {
        height: 1rem;
        width: 80%;
      }

      .meta-skeleton {
        height: 0.75rem;
        width: 50%;
      }
    }
  `]
})
export class SkeletonCardComponent {}
