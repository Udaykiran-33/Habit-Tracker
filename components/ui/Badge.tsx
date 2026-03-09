import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  variant?: "olive" | "gray" | "gold" | "silver" | "bronze" | "red" | "blue";
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({
  label,
  variant = "olive",
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        {
          "bg-[#6b8c3a]/20 text-[#8baf48] border border-[#6b8c3a]/30": variant === "olive",
          "bg-[#2D2D2A] text-[#9F9A8C] border border-[#2D2D2A]": variant === "gray",
          "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30": variant === "gold",
          "bg-slate-400/20 text-slate-300 border border-slate-400/30": variant === "silver",
          "bg-orange-700/20 text-orange-400 border border-orange-700/30": variant === "bronze",
          "bg-red-500/20 text-red-400 border border-red-500/30": variant === "red",
          "bg-blue-500/20 text-blue-400 border border-blue-500/30": variant === "blue",
        },
        {
          "px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-xs": size === "sm",
          "px-2.5 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm": size === "md",
        },
        className
      )}
    >
      {label}
    </span>
  );
}
