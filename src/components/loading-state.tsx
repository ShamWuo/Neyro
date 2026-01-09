import { LoadingSkeleton, ItemSkeleton, CardSkeleton } from "./ui/loading-skeleton";

export function LoadingState({ type = "default" }: { type?: "default" | "item" | "card" }) {
  if (type === "item") {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <ItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton className="w-2/3" />
    </div>
  );
}

