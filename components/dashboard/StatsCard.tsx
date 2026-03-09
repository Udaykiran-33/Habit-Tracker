import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent?: boolean;
  trend?: number;
}

export default function StatsCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  trend,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 sm:p-4 lg:p-5 flex flex-col gap-1 sm:gap-2",
        accent
          ? "bg-[#1a2010] border-[#6b8c3a]/40"
          : "bg-[#141414] border-[#2a2a2a]"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <p className="text-[11px] sm:text-sm text-[#888] font-medium leading-tight">{label}</p>
        <div
          className={cn(
            "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
            accent ? "bg-[#6b8c3a]/20" : "bg-[#1c1c1c]"
          )}
        >
          <Icon
            size={14}
            className={cn("sm:w-4 sm:h-4", accent ? "text-[#8baf48]" : "text-[#888]")}
          />
        </div>
      </div>
      <div>
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#f5f5f5] leading-none">{value}</p>
        {sub && <p className="text-[10px] sm:text-xs text-[#888] mt-0.5 sm:mt-1">{sub}</p>}
      </div>
      {trend !== undefined && (
        <p
          className={cn(
            "text-[10px] sm:text-xs font-medium",
            trend >= 0 ? "text-[#8baf48]" : "text-red-400"
          )}
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
        </p>
      )}
    </div>
  );
}
