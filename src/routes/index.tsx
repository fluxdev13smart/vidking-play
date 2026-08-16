import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ExternalLink, Play, Film, Tv, Clock } from "lucide-react";
import { TvButton } from "@/components/tv/TvButton";
import {
  formatTime,
  readProgress,
  tmdbSearchUrl,
  type MediaType,
  type SavedProgress,
} from "@/lib/vidking";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aperture TV — Big-Screen Player for TMDB Titles" },
      {
        name: "description",
        content:
          "Paste a TMDB ID and stream movies or series on your TV browser with a fluid, remote-friendly player and automatic resume.",
      },
      { property: "og:title", content: "Aperture TV — Big-Screen Player for TMDB Titles" },
      {
        property: "og:description",
        content:
          "A living-room player built for TV browsers: spring-driven navigation, D-pad focus, and resume where you left off.",
      },
    ],
  }),
  component: Home,
});

const spring = { type: "spring" as const, bounce: 0, duration: 0.45 };

function Home() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [tmdbId, setTmdbId] = useState("");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  const [recent, setRecent] = useState<SavedProgress[]>([]);

  useEffect(() => {
    const all = Object.values(readProgress()).sort((a, b) => b.updatedAt - a.updatedAt);
    setRecent(all.slice(0, 6));
  }, []);

  const idValid = /^\d{1,9}$/.test(tmdbId.trim());

  const play = (over?: Partial<SavedProgress>) => {
    const id = (over?.tmdbId ?? tmdbId).trim();
    if (!/^\d{1,9}$/.test(id)) return;
    navigate({
      to: "/watch",
      search: {
        type: over?.mediaType ?? mediaType,
        id,
        season: over?.season ?? Number(season) || 1,
        episode: over?.episode ?? Number(episode) || 1,
      },
    });
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12 sm:px-10 sm:py-16">
      <motion.header
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <p className="text-sm font-semibold tracking-[0.28em] text-accent uppercase">Aperture TV</p>
        <h1 className="text-glow mt-4 text-5xl leading-[0.95] font-semibold sm:text-7xl">
          Your living room,
          <br />
          one ID away.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Grab a title's TMDB ID, drop it in, and it plays full-width on the big screen. Navigation
          works with a remote — arrow keys move focus, OK plays.
        </p>
      </motion.header>

      <motion.section
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.06 }}
        className="glass-panel mt-12 rounded-3xl p-6 sm:p-9"
      >
        <div className="flex flex-wrap items-center gap-3">
          {(["movie", "tv"] as const).map((t) => {
            const active = mediaType === t;
            return (
              <TvButton
                key={t}
                variant={active ? "primary" : "ghost"}
                onClick={() => setMediaType(t)}
                aria-pressed={active}
                className={cn("relative", !active && "border border-border")}
              >
                {t === "movie" ? <Film className="size-5" /> : <Tv className="size-5" />}
                {t === "movie" ? "Movie" : "TV series"}
              </TvButton>
            );
          })}
          <a
            href={tmdbSearchUrl(mediaType)}
            target="_blank"
            rel="noreferrer noopener"
            className="press ml-auto inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-accent hover:bg-secondary/60"
          >
            Find the ID on TMDB
            <ExternalLink className="size-4" />
          </a>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-[1.6fr_repeat(2,0.7fr)]">
          <Field label="TMDB ID" hint="e.g. 1078605">
            <input
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value.replace(/[^\d]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && play()}
              inputMode="numeric"
              placeholder="1078605"
              className="w-full bg-transparent text-3xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/50"
            />
          </Field>

          <AnimatePresence initial={false} mode="popLayout">
            {mediaType === "tv" && (
              <>
                <motion.div
                  key="season"
                  initial={reduced ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? undefined : { opacity: 0, x: 24 }}
                  transition={spring}
                >
                  <Field label="Season">
                    <NumberInput value={season} onChange={setSeason} />
                  </Field>
                </motion.div>
                <motion.div
                  key="episode"
                  initial={reduced ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? undefined : { opacity: 0, x: 24 }}
                  transition={{ ...spring, delay: 0.04 }}
                >
                  <Field label="Episode">
                    <NumberInput value={episode} onChange={setEpisode} />
                  </Field>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <TvButton
          variant="primary"
          size="lg"
          disabled={!idValid}
          onClick={() => play()}
          className="mt-8 w-full sm:w-auto"
        >
          <Play className="size-5" />
          Play on the big screen
        </TvButton>
      </motion.section>

      {recent.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Continue watching</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((r, i) => (
              <motion.button
                key={r.key}
                type="button"
                onClick={() => play(r)}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.04 * i }}
                whileHover={reduced ? undefined : { scale: 1.02 }}
                whileFocus={reduced ? undefined : { scale: 1.02 }}
                whileTap={reduced ? undefined : { scale: 0.97 }}
                className="glass-panel rounded-3xl p-5 text-left outline-none"
              >
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-accent uppercase">
                  {r.mediaType === "movie" ? (
                    <Film className="size-4" />
                  ) : (
                    <Tv className="size-4" />
                  )}
                  {r.mediaType === "movie" ? "Movie" : `S${r.season} · E${r.episode}`}
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums">#{r.tmdbId}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, Math.max(2, r.progress))}%` }}
                  />
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  {formatTime(r.currentTime)} of {formatTime(r.duration)}
                </p>
              </motion.button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-2xl border border-input bg-secondary/40 px-5 py-4 focus-within:shadow-[var(--shadow-focus)]">
      <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {hint && <span className="mt-1 block text-xs text-muted-foreground/70">{hint}</span>}
    </label>
  );
}

function NumberInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
      inputMode="numeric"
      className="w-full bg-transparent text-3xl font-semibold tabular-nums outline-none"
    />
  );
}
