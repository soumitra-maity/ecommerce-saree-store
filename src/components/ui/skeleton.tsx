// src/components/ui/skeleton.tsx
import { cn } from "@/lib/utils"; // shadcn utility (create if missing)

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}