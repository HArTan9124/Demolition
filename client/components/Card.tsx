import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "gradient" | "minimal";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl transition-all duration-300",
        variant === "default" && "bg-card border border-border shadow-sm hover:shadow-md",
        variant === "gradient" && "bg-gradient-primary text-white shadow-lg",
        variant === "minimal" && "bg-transparent",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

export { Card };
