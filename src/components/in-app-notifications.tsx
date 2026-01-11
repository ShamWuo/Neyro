"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
};

type InAppNotificationsProps = {
  initialNotifications?: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
};

const typeIcons: Record<string, string> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
};

export function InAppNotifications({
  initialNotifications = [],
  onMarkRead,
  onMarkAllRead,
}: InAppNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      });
      onMarkRead?.(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    
    try {
      await fetch("/api/notifications/read-all", {
        method: "PUT",
      });
      onMarkAllRead?.();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: false } : n))
      );
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-2 text-[var(--text-primary)] hover:bg-[var(--card-muted)] transition"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--danger)] text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--elev-3)] max-h-[400px] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface)] p-4 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-[var(--primary-strong)] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition hover:bg-[var(--card-muted)] ${
                      !notification.read ? "bg-[var(--card-muted)]" : ""
                    }`}
                    onClick={() => !notification.read && handleMarkRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{typeIcons[notification.type]}</span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-[var(--primary-strong)]" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.actionUrl && notification.actionLabel && (
                          <Link
                            href={notification.actionUrl}
                            className="inline-block text-xs font-semibold text-[var(--primary-strong)] hover:underline mt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {notification.actionLabel} →
                          </Link>
                        )}
                        <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">No notifications</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
