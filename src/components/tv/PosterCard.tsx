import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { Star } from "lucide-react";
import type { TitleCard } from "@/lib/tmdb-catalog";
import { cn } from "@/lib/utils";

export function PosterCard({ item, className }: { item: TitleCard; className?: string }) {
  const reduced = useReducedMotion();

  return (
    <Link
      to="/title/$type/$id"
      params={{ type: item.mediaType === "movie" ? "movie" : "series", id: item.id }}
      className={cn("group block w-[150px] shrink-0 outline-none sm:w-[180px]", className)}
    >
      <motion.div
        {...(reduced
          ? {}
          : {
              whileHover: { scale: 1.05, y: -6 },
              whileTap: { scale: 0.98 },
              transition: { type: "spring", bounce: 0, duration: 0.35 },
            })}
        className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary shadow-[var(--shadow-lift)] group-focus-visible:shadow-[var(--shadow-focus)]"
      >
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center text-sm text-muted-foreground">
            {item.name}
          </div>
        )}
        {item.rating && (
          <span className="glass-panel absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold">
            <Star className="size-3 fill-current text-accent" />
            {item.rating}
          </span>
        )}
      </motion.div>
      <p className="mt-2 truncate text-sm font-medium">{item.name}</p>
      <p className="text-xs text-muted-foreground">{item.year ?? "—"}</p>
    </Link>
  );
}
