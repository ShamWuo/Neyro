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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Weekly Review Summary</h1>
            <p className="text-gray-600">
              {review.user.name || "User"}&apos;s review from {format(new Date(review.completedAt), "MMMM d, yyyy")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">Inbox</div>
              <div className="text-3xl font-bold text-purple-900">{review.inboxCount}</div>
              <div className="text-xs text-purple-600 mt-1">items processed</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Active Projects</div>
              <div className="text-3xl font-bold text-blue-900">{review.activeProjectsCount}/7</div>
              <div className="text-xs text-blue-600 mt-1">projects active</div>
            </div>
          </div>

          {review.areaHealthAverage !== null && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Area Health Average</div>
              <div className="text-3xl font-bold text-green-900">
                {review.areaHealthAverage.toFixed(1)}/5.0
              </div>
              <div className="text-xs text-green-600 mt-1">average across all areas</div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Powered by <span className="font-semibold">Neyro</span> - Your PARA productivity system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

