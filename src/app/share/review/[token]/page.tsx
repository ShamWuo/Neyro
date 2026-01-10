import { getSharedReview } from "@/lib/review-share";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function SharedReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const review = await getSharedReview(token);

  if (!review) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Weekly Review Summary</h1>
        {review.user.name && (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Shared by {review.user.name}
          </p>
        )}
      </div>

      <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-semibold text-[var(--text-primary)]">
              {review.inboxCount}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Inbox Items</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-semibold text-[var(--text-primary)]">
              {review.activeProjectsCount}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-semibold text-[var(--text-primary)]">
              {review.areaHealthAverage?.toFixed(1) || "—"}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Avg Area Health</div>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            Completed {new Date(review.completedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/auth/register"
          className="inline-flex items-center rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-6 py-3 text-sm font-semibold text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]"
        >
          Start your own weekly review →
        </Link>
      </div>
    </div>
  );
}
