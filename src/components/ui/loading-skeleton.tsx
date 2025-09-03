import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shimmer' | 'wave'
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const baseClasses = "animate-pulse rounded-md bg-muted"
  
  const variantClasses = {
    default: "",
    shimmer: "bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%] animate-shimmer",
    wave: "bg-gradient-to-r from-muted to-muted/60 animate-pulse"
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
}

// Predefined skeleton components for common use cases
const SkeletonCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-lg border bg-card p-6 shadow-soft", className)} {...props}>
    <div className="space-y-3">
      <Skeleton className="h-4 w-1/3" variant="shimmer" />
      <Skeleton className="h-8 w-2/3" variant="shimmer" />
      <Skeleton className="h-3 w-1/2" variant="shimmer" />
    </div>
  </div>
)

const SkeletonTable = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-4 flex-1" variant="shimmer" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 flex-1" variant="shimmer" />
        ))}
      </div>
    ))}
  </div>
)

const SkeletonList = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" variant="shimmer" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" variant="shimmer" />
          <Skeleton className="h-3 w-1/3" variant="shimmer" />
        </div>
      </div>
    ))}
  </div>
)

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonList }