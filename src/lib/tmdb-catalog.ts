import type { MediaType } from "./vidking";

/** Public community TMDB catalog service (Stremio addon protocol). No API key required. */
export const CATALOG_BASE = "https://94c8cb9f702d-tmdb-addon.baby-beamup.club";

/** Catalog "type" in the upstream service. */
export type CatalogType = "movie" | "series";

export const catalogTypeFor = (m: MediaType): CatalogType => (m === "movie" ? "movie" : "series");
export const mediaTypeFor = (c: CatalogType): MediaType => (c === "movie" ? "movie" : "tv");

export interface TitleCard {
  id: string;
  mediaType: MediaType;
  name: string;
  poster: string | null;
  backdrop: string | null;
  year: string | null;
  rating: string | null;
  overview: string | null;
  genres: string[];
}

export interface EpisodeItem {
  season: number;
  episode: number;
  name: string;
  overview: string | null;
  thumbnail: string | null;
  rating: string | null;
  runtime: string | null;
  released: string | null;
}

export interface TitleDetail extends TitleCard {
  runtime: string | null;
  cast: string[];
  director: string[];
  country: string | null;
  status: string | null;
  episodes: EpisodeItem[];
  seasons: number[];
}

interface RawMeta {
  id?: string;
  type?: string;
  name?: string;
  poster?: string;
  background?: string;
  year?: string;
  imdbRating?: string;
  description?: string;
  genre?: string[] | string;
  runtime?: string;
  cast?: string[];
  director?: string[];
  country?: string;
  status?: string;
  videos?: Array<{
    season?: number;
    episode?: number;
    number?: number;
    name?: string;
    overview?: string;
    thumbnail?: string;
    rating?: string;
    runtime?: string;
    released?: string;
  }>;
}

const asArray = (v: string[] | string | undefined): string[] =>
  Array.isArray(v) ? v : v ? [v] : [];

/** `tmdb:27205` -> `27205` */
export function stripPrefix(id: string): string {
  return id.replace(/^tmdb:/, "");
}

export function toCard(raw: RawMeta, fallbackType: CatalogType): TitleCard {
  const type = (raw.type === "series" ? "series" : raw.type === "movie" ? "movie" : fallbackType) as CatalogType;
  return {
    id: stripPrefix(raw.id ?? ""),
    mediaType: mediaTypeFor(type),
    name: raw.name ?? "Untitled",
    poster: raw.poster ?? null,
    backdrop: raw.background ?? null,
    year: raw.year ?? null,
    rating: raw.imdbRating ?? null,
    overview: raw.description ?? null,
    genres: asArray(raw.genre),
  };
}

export function toDetail(raw: RawMeta, fallbackType: CatalogType): TitleDetail {
  const episodes: EpisodeItem[] = (raw.videos ?? [])
    .filter((v) => (v.season ?? 0) > 0)
    .map((v) => ({
      season: v.season ?? 1,
      episode: v.episode ?? v.number ?? 1,
      name: v.name ?? `Episode ${v.episode ?? v.number ?? 1}`,
      overview: v.overview ?? null,
      thumbnail: v.thumbnail ?? null,
      rating: v.rating ?? null,
      runtime: v.runtime ?? null,
      released: v.released ?? null,
    }))
    .sort((a, b) => a.season - b.season || a.episode - b.episode);

  return {
    ...toCard(raw, fallbackType),
    runtime: raw.runtime ?? null,
    cast: (raw.cast ?? []).slice(0, 12),
    director: raw.director ?? [],
    country: raw.country ?? null,
    status: raw.status ?? null,
    episodes,
    seasons: [...new Set(episodes.map((e) => e.season))],
  };
}

export const MOVIE_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
  "War",
  "Western",
];

export const SERIES_GENRES = [
  "Action & Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Kids",
  "Mystery",
  "Reality",
  "Sci-Fi & Fantasy",
  "Soap",
  "War & Politics",
  "Western",
];

export const YEARS = Array.from({ length: 21 }, (_, i) => String(2026 - i));
