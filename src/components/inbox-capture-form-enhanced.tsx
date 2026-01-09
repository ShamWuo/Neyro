"use client";

import { useState, useRef } from "react";
import { createItem } from "@/app/(dashboard)/inbox/actions";
import { showToast } from "./ui/toast";
import { NativeCameraButton } from "./native-camera-button";
import { isNative } from "@/lib/capacitor";

type InboxCaptureFormEnhancedProps = {
  onSuccess?: () => void;
  className?: string;
};

export function InboxCaptureFormEnhanced({ onSuccess, className }: InboxCaptureFormEnhancedProps) {
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Used in disabled prop and button text
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imageDataUrl) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      if (imageDataUrl) {
        formData.append("imageDataUrl", imageDataUrl);
      }

      await createItem(formData);
      setText("");
      setImageDataUrl(null);
      showToast("Item captured!", "success");
      onSuccess?.();
    } catch {
      showToast("Failed to capture item", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image too large (max 5MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setImageDataUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageCaptured = (dataUrl: string) => {
    setImageDataUrl(dataUrl);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full min-h-[100px] rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          disabled={loading}
        />

        {!isNative && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              📷 Attach image
            </button>
          </div>
        )}

        {isNative && (
          <NativeCameraButton onImageCaptured={handleImageCaptured} />
        )}

        {imageDataUrl && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageDataUrl}
              alt="Preview"
              className="max-h-48 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => setImageDataUrl(null)}
              className="absolute right-2 top-2 rounded-full bg-[var(--overlay)] p-1 text-[var(--text-inverse)] hover:bg-[var(--overlay-light)]"
            >
              ×
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!text.trim() && !imageDataUrl)}
          className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] disabled:opacity-50"
        >
          {loading ? "Capturing..." : "Capture"}
        </button>
      </div>
    </form>
  );
}

