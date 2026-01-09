"use client";

import { useState } from "react";
import { capturePhoto, pickFromGallery, isNative } from "@/lib/capacitor";
import { showToast } from "./ui/toast";

type NativeCameraButtonProps = {
  onImageCaptured: (dataUrl: string) => void;
  className?: string;
};

export function NativeCameraButton({ onImageCaptured, className }: NativeCameraButtonProps) {
  const [loading, setLoading] = useState(false);

  if (!isNative) return null;

  const handleCapture = async () => {
    setLoading(true);
    try {
      const image = await capturePhoto();
      if (image) {
        onImageCaptured(image);
        showToast("Photo captured!", "success");
      }
    } catch {
      showToast("Failed to capture photo", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePickFromGallery = async () => {
    setLoading(true);
    try {
      const image = await pickFromGallery();
      if (image) {
        onImageCaptured(image);
        showToast("Photo selected!", "success");
      }
    } catch {
      showToast("Failed to pick photo", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className || ""}`}>
      <button
        type="button"
        onClick={handleCapture}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] disabled:opacity-50"
      >
        <span>📷</span>
        <span>Camera</span>
      </button>
      <button
        type="button"
        onClick={handlePickFromGallery}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] disabled:opacity-50"
      >
        <span>🖼️</span>
        <span>Gallery</span>
      </button>
    </div>
  );
}


