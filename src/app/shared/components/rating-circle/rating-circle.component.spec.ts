import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingCircleComponent } from './rating-circle.component';

describe('RatingCircleComponent', () => {
  let fixture: ComponentFixture<RatingCircleComponent>;

  const render = (rating: number) => {
    fixture.componentRef.setInput('rating', rating);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return {
      text: el.querySelector('.rating-text')?.textContent?.trim(),
      color: el.querySelector('.circle-fill')?.getAttribute('stroke'),
      dash: el.querySelector('.circle-fill')?.getAttribute('stroke-dasharray'),
    };
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingCircleComponent);
  });

  it('shows the TMDB score with one decimal, and N/A for unrated titles', () => {
    expect(render(7.264).text).toBe('7.3');
    expect(render(0).text).toBe('N/A');
  });

  it('colours the ring green from 7, amber from 5 and red below', () => {
    expect(render(7).color).toBe('#22c55e');
    expect(render(6.9).color).toBe('#f59e0b');
    expect(render(5).color).toBe('#f59e0b');
    expect(render(4.9).color).toBe('#ef4444');
  });

  it('fills the ring in proportion to the score, never past full', () => {
    expect(render(6.5).dash).toBe('65, 100');
    expect(render(10).dash).toBe('100, 100');
    expect(render(12).dash).toBe('100, 100');
  });
});
