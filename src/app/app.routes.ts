import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'movies',
    loadComponent: () => import('./features/movies/movies.component').then(m => m.MoviesComponent)
  },
  {
    path: 'movies/:id',
    loadComponent: () => import('./features/movie-detail/movie-detail.component').then(m => m.MovieDetailComponent)
  },
  {
    path: 'tv',
    loadComponent: () => import('./features/tv-shows/tv-shows.component').then(m => m.TvShowsComponent)
  },
  {
    path: 'tv/:id',
    loadComponent: () => import('./features/tv-detail/tv-detail.component').then(m => m.TvDetailComponent)
  },
  {
    path: 'person/:id',
    loadComponent: () => import('./features/person/person.component').then(m => m.PersonComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'trending',
    loadComponent: () => import('./features/trending/trending.component').then(m => m.TrendingComponent)
  },
  {
    path: 'discover',
    loadComponent: () => import('./features/discover/discover.component').then(m => m.DiscoverComponent)
  },
  {
    path: 'watchlist',
    loadComponent: () => import('./features/watchlist/watchlist.component').then(m => m.WatchlistComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
