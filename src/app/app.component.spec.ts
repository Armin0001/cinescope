import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('lays out the navbar, the routed page and the footer', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('app-navbar')).not.toBeNull();
    expect(el.querySelector('main router-outlet')).not.toBeNull();
    expect(el.querySelector('app-footer')).not.toBeNull();
  });

  it('applies the saved theme as soon as the app starts', () => {
    localStorage.setItem('cinescope-theme', 'light');

    TestBed.createComponent(AppComponent).detectChanges();

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
