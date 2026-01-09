import { getSharedReview } from "@/lib/review-share";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function SharedReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const review = await getSharedReview(token);

  if (!review) {
    notFound();
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--primary-weak)] to-[var(--accent-weak)] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[var(--card)] rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Weekly Review Summary</h1>
            <p className="text-[var(--text-secondary)]">
              {review.user.name || "User"}&apos;s review from {format(new Date(review.completedAt), "MMMM d, yyyy")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--primary-weak)] rounded-lg p-4">
              <div className="text-sm text-[var(--primary-strong)] font-medium">Inbox</div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">{review.inboxCount}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">items processed</div>
            </div>

            <div className="bg-[color-mix(in_srgb,var(--primary-strong)_10%,var(--card))] rounded-lg p-4">
              <div className="text-sm text-[var(--primary-strong)] font-medium">Active Projects</div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">{review.activeProjectsCount}/7</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">projects active</div>
            </div>
          </div>

          {review.areaHealthAverage !== null && (
            <div className="bg-[var(--success-weak)] rounded-lg p-4">
              <div className="text-sm text-[var(--success)] font-medium">Area Health Average</div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">
                {review.areaHealthAverage.toFixed(1)}/5.0
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">average across all areas</div>
            </div>
          )}

          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--text-secondary)] text-center">
              Powered by <span className="font-semibold">Neyro</span> - Your PARA productivity system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

