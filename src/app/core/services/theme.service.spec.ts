import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

const STORAGE_KEY = 'cinescope-theme';

describe('ThemeService', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to dark', () => {
    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
  });

  it('restores the theme chosen on a previous visit', () => {
    localStorage.setItem(STORAGE_KEY, 'light');

    expect(TestBed.inject(ThemeService).isDark()).toBeFalse();
  });

  it('ignores an unknown stored value', () => {
    localStorage.setItem(STORAGE_KEY, 'neon');

    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
  });

  it('applies and saves a toggled theme', () => {
    const service = TestBed.inject(ThemeService);

    service.toggleTheme();
    TestBed.flushEffects();

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });
});
