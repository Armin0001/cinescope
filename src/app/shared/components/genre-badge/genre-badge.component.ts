import { Component, input } from '@angular/core';

@Component({
  selector: 'app-genre-badge',
  standalone: true,
  template: `
    <span class="genre-badge">{{ name() }}</span>
  `,
  styles: [`
    .genre-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      background: var(--tag-bg);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      white-space: nowrap;
      transition: all 0.2s ease;

      &:hover {
        background: var(--accent-color);
        color: white;
        border-color: var(--accent-color);
      }
    }
  `]
})
export class GenreBadgeComponent {
  name = input<string>('');
}
