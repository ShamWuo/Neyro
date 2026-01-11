import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminTelemetryPage() {
  const session = await auth();
  const adminList = (process.env.ADMIN_USERS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

  const userEmail = session?.user?.email?.toLowerCase();
  if (!session || !userEmail || !adminList.includes(userEmail)) {
    // redirect to login if not authorized
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Unauthorized</h1>
        <p className="text-sm text-muted">You must be an admin to view this page.</p>
      </div>
    );
  }

  const entries = await prisma.activityLog.findMany({ where: { type: "quick_capture" }, orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Quick-capture telemetry</h1>
      <p className="mb-4 text-sm text-[var(--text-secondary)]">Showing latest {entries.length} quick-capture events.</p>
      <div className="overflow-auto">
        <table className="min-w-full border-collapse table-auto text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-3 py-2 border-b">ID</th>
              <th className="px-3 py-2 border-b">User</th>
              <th className="px-3 py-2 border-b">Item</th>
              <th className="px-3 py-2 border-b">Source</th>
              <th className="px-3 py-2 border-b">User Agent</th>
              <th className="px-3 py-2 border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const meta = (e.meta || {}) as any;
              return (
                <tr key={e.id} className="align-top">
                  <td className="px-3 py-2 border-b">{e.id}</td>
                  <td className="px-3 py-2 border-b">{e.userId}</td>
                  <td className="px-3 py-2 border-b">{meta?.itemId || "-"}</td>
                  <td className="px-3 py-2 border-b">{meta?.source || "-"}</td>
                  <td className="px-3 py-2 border-b max-w-sm truncate">{meta?.userAgent || "-"}</td>
                  <td className="px-3 py-2 border-b">{new Date(e.createdAt).toISOString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
