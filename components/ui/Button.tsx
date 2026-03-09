import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111111] disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[#6b8c3a] text-[#FAF6F0] hover:bg-[#7a9e43] focus:ring-[#6b8c3a]":
              variant === "primary",
            "bg-[#222222] text-[#FAF6F0] border border-[#2D2D2A] hover:bg-[#2D2D2A] focus:ring-[#6b8c3a]":
              variant === "secondary",
            "text-[#9F9A8C] hover:text-[#FAF6F0] hover:bg-[#222222] focus:ring-[#6b8c3a]":
              variant === "ghost",
            "bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600/20 focus:ring-red-500":
              variant === "danger",
            "border border-[#6b8c3a] text-[#6b8c3a] hover:bg-[#6b8c3a]/10 focus:ring-[#6b8c3a]":
              variant === "outline",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
