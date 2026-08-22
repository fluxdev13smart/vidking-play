# Real Movies & Shows on the Home Screen (No API Key Needed)

That link works. It's a public TMDB catalog service that returns full movie/series data — posters, backdrops, descriptions, ratings, cast, and episode lists — with no API key and no account. I tested it live:

- Popular / Trending / Latest Releases / By Year / By Language catalogs for both movies and series: working
- Title details (Inception, Breaking Bad) including poster, backdrop, genres, IMDb rating: working
- Full episode lists per season for series: working (71 episodes returned for Breaking Bad)
- Its own search endpoint: currently failing (server timeout) — see "Search" below

Its IDs are TMDB IDs (`tmdb:27205` = Inception), so they drop straight into the existing Vidking player with no translation.

## What gets built

**New home screen — Apple TV style**

- Full-bleed hero at the top: backdrop of the #1 trending title, with its logo-style title, year, rating, short synopsis, and a large Play button.
- Horizontal poster shelves below, each scrolling sideways: Trending Movies, Popular Movies, Latest Releases, Trending Series, Popular Series.
- Poster cards scale up and lift on hover/focus with the existing spring motion, so a TV remote's arrow keys walk across a row and OK plays.
- "Continue watching" shelf stays, but cards now show the real poster and title instead of `#1078605`.

**Title detail screen**

- Clicking a poster opens a detail page: backdrop, synopsis, rating, runtime, genres, cast.
- Movies: one big Play button.
- Series: season picker plus an episode list with thumbnails and titles; clicking an episode plays that exact season/episode in the player.

**Player screen**

- Header shows the real title (and episode name for series) instead of the TMDB number.
- Next/previous episode buttons use the real episode list, so they stop at the true end of a season instead of counting upward forever.

**Browse by genre / year**

- A browse screen using the catalog's genre, year, and language filters, paginated as you scroll.

**Search**

- The catalog's search endpoint is returning server timeouts right now, so search will be wired up but marked as a graceful failure: if it returns nothing, the screen shows a message and the manual TMDB-ID entry stays available as a fallback. If the endpoint recovers, search starts working with no further changes.

The current TMDB-ID entry box moves off the home screen into a small "Enter an ID" corner of the browse/search screen — still there, just no longer the main way in.

## Technical notes

- Add `src/lib/tmdb-catalog.ts`: typed fetch helpers for `/catalog/{type}/{catalogId}.json`, `/catalog/{type}/{catalogId}/genre={g}&skip={n}.json`, and `/meta/{type}/tmdb:{id}.json`, mapping responses to plain DTOs (id, title, poster, backdrop, year, rating, overview, episodes).
- Fetch through `createServerFn` wrappers in `src/lib/catalog.functions.ts` so the upstream host isn't hit from the browser and responses can be cached server-side; base URL lives in a constant, not a secret.
- Route loaders prime TanStack Query with `ensureQueryData`; components read via `useSuspenseQuery`. Each new route gets `errorComponent` and `notFoundComponent`.
- New routes: `/title/$type/$id` (detail), `/browse` (genre/year + search + manual ID). `/watch` keeps its current search-param contract and additionally loads meta for the header/episode navigation.
- Images come from `image.tmdb.org` directly, lazy-loaded, with a poster placeholder while loading.
- Upstream is a free community service with occasional timeouts, so every fetch gets a timeout, and each shelf fails independently — one slow row never blanks the page.
