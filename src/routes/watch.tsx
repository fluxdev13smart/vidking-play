import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ExternalLink, Maximize2, SkipBack, SkipForward } from "lucide-react";
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
  id: z.string().regex(/^\d{1,9}$/).default("1078605"),
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
          "Full-width player for TV browsers with resume, next-episode controls and a direct link to the title on TMDB.",
      },
      { property: "og:title", content: "Now Playing — Aperture TV" },
      {
        property: "og:description",
        content: "Big-screen playback with automatic resume and remote-friendly controls.",
      },
    ],
  }),
  component: Watch;
});

function Watch() {
  return null;
}
