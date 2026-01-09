"use client";

import { useState, useRef } from "react";
import { VoiceInputButton } from "./voice-input-button";
import { useRouter } from "next/navigation";
import { useDuplicateDetection, DuplicateWarning } from "./duplicate-detection";

type InboxCaptureFormProps = {
  createItemAction: (formData: FormData) => Promise<void>;
};

export function InboxCaptureForm({ createItemAction }: InboxCaptureFormProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [url, setUrl] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState<"NOTE" | "TASK" | "LINK">("NOTE");
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const { similarItems } = useDuplicateDetection({
    title,
    details,
    onDuplicateFound: () => {
      // Warning will be shown via DuplicateWarning component
    },
  });

  const handleVoiceTranscript = (text: string) => {
    // Auto-fill title with voice input
    if (!title) {
      setTitle(text);
    } else {
      // Append to details if title already exists
      setDetails((prev) => (prev ? `${prev}\n${text}` : text));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("details", details);
    formData.append("url", url);
    formData.append("dueDate", dueDate);
    formData.append("type", type);
    await createItemAction(formData);
    // Reset form
    setTitle("");
    setDetails("");
    setUrl("");
    setDueDate("");
    router.refresh();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="panel space-y-3">
      {showDuplicateWarning && similarItems.length > 0 && (
        <DuplicateWarning
          similarItems={similarItems}
          onDismiss={() => setShowDuplicateWarning(false)}
        />
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="inbox-title" className="sr-only">
            Title
          </label>
          <input
            id="inbox-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            aria-label="Item title"
            className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
            required
          />
          <VoiceInputButton onTranscript={handleVoiceTranscript} />
        </div>
        <div>
          <label htmlFor="inbox-type" className="sr-only">
            Item type
          </label>
          <select
            id="inbox-type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "NOTE" | "TASK" | "LINK")}
            aria-label="Select item type"
            className="w-full border border-[var(--border-default)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)]"
          >
            <option value="NOTE">NOTE</option>
            <option value="TASK">TASK</option>
            <option value="LINK">LINK</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="inbox-details" className="sr-only">
          Details
        </label>
        <textarea
          id="inbox-details"
          name="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Details"
          aria-label="Item details"
          className="w-full border border-[var(--border-default)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          rows={3}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="inbox-url" className="sr-only">
            URL
          </label>
          <input
            id="inbox-url"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (optional)"
            aria-label="URL (optional)"
            className="w-full border border-[var(--border-default)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
        </div>
        <div>
          <label htmlFor="inbox-due-date" className="sr-only">
            Due date
          </label>
          <input
            id="inbox-due-date"
            name="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="Due date (optional)"
            aria-label="Due date (optional)"
            className="w-full border border-[var(--border-default)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)]"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)]"
        >
          Add to Inbox
        </button>
        <span className="text-xs text-[var(--text-secondary)]">Everything starts here. Classify later.</span>
      </div>
    </form>
  );
}

