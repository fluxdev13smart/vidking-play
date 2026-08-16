import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ExternalLink, SkipBack, SkipForward } from "lucide-react";
import { z } from "zod";
import { TvButton } from "@/components/tv/TvButton";
import {
  buildEmbedUrl,
  formatTime,
  progressKey,
  readProgress,
  tmdbDetailUrl,
  writeProgress,
  type PlayerEvent,
} from "@/lib/vidking";

const searchSchema = z.object({
  type: z.enum(["movie", "tv"]).default("movie"),
  id: z.coerce.number().int().min(1).max(999999999).default(1078605),
  season: z.coerce.number().int().min(1).default(1),
  episode: z.coerce.number().int().min(1).default(1),
});


export const Route = createFileRoute("/watch")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Now Playing — Aperture TV" },
      {
        name: "description",
        content:
          "Full-width player for TV browsers with automatic resume, next-episode controls and a direct link to the title on TMDB.",
      },
      { property: "og:title", content: "Now Playing — Aperture TV" },
      {
        property: "og:description",
        content: "Big-screen playback with automatic resume and remote-friendly controls.",
      },
    ],
  }),
  component: Watch,
});

const spring = { type: "spring" as const, bounce: 0, duration: 0.45 };

function Watch() {
  const { type, id: numericId, season, episode } = Route.useSearch();
  const id = String(numericId);
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "ended">("idle");
  const [position, setPosition] = useState({ currentTime: 0, duration: 0, progress: 0 });
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const latest = useRef(position);

  const key = progressKey({ mediaType: type, tmdbId: id, season, episode });


  // Resolve the resume point once per title, before the iframe mounts.
  useEffect(() => {
    const saved = readProgress()[key];
    setResumeAt(saved && saved.progress < 97 ? saved.currentTime : 0);
    setPosition({ currentTime: 0, duration: 0, progress: 0 });
    setStatus("idle");
  }, [key]);

  const src = useMemo(() => {
    if (resumeAt === null) return null;
    return buildEmbedUrl({
      mediaType: type,
      tmdbId: id,
      season,
      episode,
      autoPlay: true,
      progress: resumeAt,
      color: "e0603a",
    });
  }, [resumeAt, type, id, season, episode]);

  // Player -> parent progress events.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      let payload: { type?: string; data?: PlayerEvent };
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      if (payload?.type !== "PLAYER_EVENT" || !payload.data) return;
      const d = payload.data;

      if (d.event === "play") setStatus("playing");
      if (d.event === "pause") setStatus("paused");
      if (d.event === "ended") setStatus("ended");
      if (d.event === "timeupdate" || d.event === "seeked") setStatus("playing");

      const next = {
        currentTime: d.currentTime ?? 0,
        duration: d.duration ?? 0,
        progress: d.progress ?? 0,
      };
      latest.current = next;
      setPosition(next);

      writeProgress({
        key,
        mediaType: type,
        tmdbId: id,
        season,
        episode,
        ...next,
        updatedAt: Date.now(),
      });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [key, type, id, season, episode]);

  const goEpisode = (delta: number) => {
    const nextEpisode = Math.max(1, episode + delta);
    navigate({ to: "/watch", search: { type, id: numericId, season, episode: nextEpisode } });
  };

  return (
    <main className="min-h-screen">
      <motion.header
        initial={reduced ? false : { opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="glass-bar sticky top-0 z-20 border-b border-border"
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3 px-5 py-3 sm:px-8">
          <Link to="/" className="rounded-2xl outline-none">
            <TvButton variant="ghost" tabIndex={-1}>
              <ArrowLeft className="size-5" />
              Back
            </TvButton>
          </Link>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold">
              TMDB #{id}
              {type === "tv" && (
                <span className="text-muted-foreground">
                  {" "}
                  · S{season} E{episode}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {status === "idle" ? "Loading player" : status}
              {position.duration > 0 &&
                ` · ${formatTime(position.currentTime)} / ${formatTime(position.duration)}`}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {type === "tv" && (
              <>
                <TvButton onClick={() => goEpisode(-1)} disabled={episode <= 1} aria-label="Previous episode">
                  <SkipBack className="size-5" />
                </TvButton>
                <TvButton onClick={() => goEpisode(1)} aria-label="Next episode">
                  <SkipForward className="size-5" />
                </TvButton>
              </>
            )}
            <a
              href={tmdbDetailUrl(type, id)}
              target="_blank"
              rel="noreferrer noopener"
              className="press inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-accent hover:bg-secondary/60"
            >
              View on TMDB
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>

        <div className="h-1 w-full bg-secondary/60">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${Math.min(100, position.progress)}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          />
        </div>
      </motion.header>

      <motion.section
        initial={reduced ? false : { opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring, delay: 0.05 }}
        className="mx-auto w-full max-w-[1600px] px-0 py-0 sm:px-8 sm:py-6"
      >
        <div className="overflow-hidden border-border bg-card shadow-[var(--shadow-lift)] sm:rounded-3xl sm:border">
          <div className="relative aspect-video w-full">
            {src && (
              <iframe
                key={src}
                src={src}
                title={`Player for TMDB ${id}`}
                className="absolute inset-0 h-full w-full"
                frameBorder="0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>

        {resumeAt !== null && resumeAt > 5 && (
          <p className="px-5 pt-4 text-sm text-muted-foreground sm:px-0">
            Resumed at {formatTime(resumeAt)} from your last session on this device.
          </p>
        )}
      </motion.section>
    </main>
  );
}
