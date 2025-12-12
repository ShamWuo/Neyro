"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable;
      if (isTyping) return;

      if (e.key === "c") {
        router.push("/inbox");
      } else if (e.key === "p") {
        router.push("/projects");
      } else if (e.key === "a") {
        router.push("/areas");
      } else if (e.key === "r") {
        router.push("/resources");
      } else if (e.key.toLowerCase() === "f") {
        router.push("/focus");
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("command-palette:toggle"));
      } else if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("shortcuts:toggle"));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return null;
}
