import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
}

export function Card({ className, glass, hover, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#2a2a2a] bg-[#141414] p-5",
        glass && "bg-[#141414]/80 backdrop-blur-sm",
        hover && "hover:border-[#6b8c3a]/40 transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-[#f5f5f5]", className)} {...props}>
      {children}
    </h3>
  );
}
