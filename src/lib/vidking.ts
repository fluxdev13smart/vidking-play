export type MediaType = "movie" | "tv";

export interface PlayerConfig {
  mediaType: MediaType;
  tmdbId: string;
  season: number;
  episode: number;
  autoPlay: boolean;
  progress?: number;
  /** hex without # */
  color: string;
}

export function buildEmbedUrl(c: PlayerConfig): string {
  const base =
    c.mediaType === "movie"
      ? `https://www.vidking.net/embed/movie/${c.tmdbId}`
      : `https://www.vidking.net/embed/tv/${c.tmdbId}/${c.season}/${c.episode}`;

  const params = new URLSearchParams({ color: c.color });
  if (c.autoPlay) params.set("autoPlay", "true");
  if (c.mediaType === "tv") {
    params.set("nextEpisode", "true");
    params.set("episodeSelector", "true");
  }
  if (c.progress && c.progress > 5) params.set("progress", String(Math.floor(c.progress)));

  return `${base}?${params.toString()}`;
}

export function tmdbSearchUrl(mediaType: MediaType): string {
  return mediaType === "movie"
    ? "https://www.themoviedb.org/movie"
    : "https://www.themoviedb.org/tv";
}

export function tmdbDetailUrl(mediaType: MediaType, tmdbId: string): string {
  return `https://www.themoviedb.org/${mediaType}/${tmdbId}`;
}

export interface PlayerEvent {
  event: "timeupdate" | "play" | "pause" | "ended" | "seeked";
  currentTime: number;
  duration: number;
  progress: number;
  id: string;
  mediaType: MediaType;
  season?: number;
  episode?: number;
  timestamp: number;
}

const STORE_KEY = "cinema-tv:progress";

export function progressKey(c: Pick<PlayerConfig, "mediaType" | "tmdbId" | "season" | "episode">) {
  return c.mediaType === "movie"
    ? `movie:${c.tmdbId}`
    : `tv:${c.tmdbId}:${c.season}:${c.episode}`;
}

export interface SavedProgress {
  key: string;
  mediaType: MediaType;
  tmdbId: string;
  season: number;
  episode: number;
  currentTime: number;
  duration: number;
  progress: number;
  updatedAt: number;
}

export function readProgress(): Record<string, SavedProgress> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function writeProgress(entry: SavedProgress) {
  if (typeof window === "undefined") return;
  const all = readProgress();
  all[entry.key] = entry;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(all));
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}
