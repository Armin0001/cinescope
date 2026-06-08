import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-circle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rating-circle" [class]="sizeClass()">
      <svg viewBox="0 0 36 36">
        <path
          class="circle-bg"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          class="circle-fill"
          [attr.stroke]="ratingColor()"
          [attr.stroke-dasharray]="dashArray()"
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <text x="18" y="20.5" class="rating-text" [attr.fill]="ratingColor()">
          {{ displayRating() }}
        </text>
      </svg>
    </div>
  `,
  styles: [`
    .rating-circle {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &.size-sm { width: 36px; height: 36px; }
      &.size-md { width: 48px; height: 48px; }
      &.size-lg { width: 64px; height: 64px; }

      svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .circle-bg {
        fill: none;
        stroke: rgba(255,255,255,0.1);
        stroke-width: 3;
      }

      .circle-fill {
        fill: none;
        stroke-width: 3;
        stroke-linecap: round;
        transition: stroke-dasharray 0.5s ease;
      }

      .rating-text {
        transform: rotate(90deg);
        transform-origin: center;
        font-size: 10px;
        font-weight: 700;
        text-anchor: middle;
        dominant-baseline: middle;
        font-family: 'Inter', sans-serif;
      }
    }
  `]
})
export class RatingCircleComponent {
  rating = input<number>(0);
  size = input<'sm' | 'md' | 'lg'>('md');

  sizeClass = computed(() => `size-${this.size()}`);

  displayRating = computed(() => {
    const r = this.rating();
    return r > 0 ? r.toFixed(1) : 'N/A';
  });

  ratingColor = computed(() => {
    const r = this.rating();
    if (r >= 7) return '#22c55e';
    if (r >= 5) return '#f59e0b';
    return '#ef4444';
  });

  dashArray = computed(() => {
    const pct = Math.min((this.rating() / 10) * 100, 100);
    return `${pct}, 100`;
  });
}
