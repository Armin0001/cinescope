# 🎬 CineScope

A full-featured movie & TV discovery app powered by the [TMDB API](https://www.themoviedb.org/). Browse trending titles, search across movies, shows & people, explore cast & crew, watch trailers, and manage personal watchlists.

![CineScope Preview](https://image.tmdb.org/t/p/w1280/your-screenshot.jpg)

---

## ✨ Features

- 🔥 **Trending** — today & this week, across movies and TV
- 🔍 **Instant search** — typeahead suggestions with 300ms debounce
- 🎬 **Movie & TV detail pages** — cast, crew, videos, images, reviews, similar titles, watch providers
- 🧑 **Person pages** — biography, filmography
- 🗂️ **Discover** — advanced filters (genre, year, rating, language) + Surprise Me random picker
- ❤️ **Watchlists** — Want to Watch, Watching, Completed, Favorites (stored locally)
- 🌙 **Dark / Light mode** — persisted across sessions
- 📱 **Fully responsive** — mobile, tablet, desktop
- ⚡ **Skeleton loading** — no spinners, smooth perceived performance
- ♾️ **Infinite scroll** — on all browse & discover pages

---

## 🛠 Tech Stack

| | |
|---|---|
| Framework | [Angular 18](https://angular.dev) (standalone components, signals) |
| Styling | SCSS with CSS custom properties |
| Data | [TMDB API v3](https://developer.themoviedb.org) |
| Scroll | [ngx-infinite-scroll](https://github.com/orizens/ngx-infinite-scroll) |
| Deployment | [Vercel](https://vercel.com) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A free [TMDB API key](https://www.themoviedb.org/settings/api)

### Install & run

```bash