import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "glass" | "ghost";

interface TvButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "lg";
}

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  glass: "glass-panel text-foreground hover:bg-glass-strong",
  ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60",
};

/**
 * Focus-first, press-on-pointer-down button.
 * Springs handle the scale so a press can be interrupted / released mid-flight.
 */
export const TvButton = forwardRef<HTMLButtonElement, TvButtonProps>(
  ({ className, variant = "glass", size = "md", ...props }, ref) => {
    const reduced = useReducedMotion();
    const spring = { type: "spring" as const, bounce: 0, duration: 0.35 };

    return (
      <motion.button
        ref={ref}
        // Feedback lives on the press, instantly — not on release.
        whileTap={reduced ? undefined : { scale: 0.96 }}
        whileHover={reduced ? undefined : { scale: 1.02 }}
        whileFocus={reduced ? undefined : { scale: 1.02 }}
        transition={spring}
        className={cn(
          "inline-flex select-none items-center justify-center gap-2 rounded-2xl font-medium",
          "outline-none disabled:pointer-events-none disabled:opacity-50",
          size === "lg" ? "px-8 py-4 text-lg" : "px-5 py-3 text-base",
          variants[variant],
          className,
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      />
    );
  },
);
TvButton.displayName = "TvButton";
