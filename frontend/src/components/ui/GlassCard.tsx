import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type Tint = "purple" | "cyan" | "emerald" | "rose" | "amber" | "none";

interface GlassCardProps {
  children: ReactNode;
  tint?: Tint;
  className?: string;
  delay?: number;
  hover?: boolean;
}

const tintMap: Record<Tint, string> = {
  purple: "bg-purple-500/10 border-purple-500/15",
  cyan: "bg-cyan-500/10 border-cyan-500/15",
  emerald: "bg-emerald-500/10 border-emerald-500/15",
  rose: "bg-rose-500/10 border-rose-500/15",
  amber: "bg-amber-500/10 border-amber-500/15",
  none: "",
};

const glowMap: Record<Tint, string> = {
  purple: "glow-purple",
  cyan: "glow-cyan",
  emerald: "glow-emerald",
  rose: "",
  amber: "",
  none: "",
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export function GlassCard({
  children,
  tint = "none",
  className,
  delay = 0,
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "glass relative overflow-hidden rounded-2xl p-6",
        tintMap[tint],
        glowMap[tint],
        hover &&
          "transition-transform duration-300 hover:scale-[1.01] hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Inner highlight reflection */}
      <div className="glass-highlight pointer-events-none absolute inset-0 rounded-2xl" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
