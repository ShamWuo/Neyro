"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type InboxSuggestion = {
  itemIds: string[];
  suggestedTitle: string;
  description?: string;
};

interface InboxProjectSuggestionsProps {
  inboxItems?: Array<{ id: string; title: string; classification: string }>;
  onCreateProject?: (suggestion: InboxSuggestion) => void;
}

export default function InboxProjectSuggestions({ inboxItems = [], onCreateProject }: InboxProjectSuggestionsProps) {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState<InboxSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inboxItems.length || !session?.user?.id) return;

    async function fetchSuggestions() {
      setLoading(true);
      try {
        const res = await fetch("/api/inbox/suggest-projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemIds: inboxItems.map(i => i.id) }),
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (e) {
        console.warn("Failed to fetch project suggestions", e);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, [inboxItems, session]);

  if (!suggestions.length || loading) return null;

  return (
    <div className="inbox-suggestions" role="region" aria-label="Project suggestions">
      <h3 className="inbox-suggestions__title">Suggested Projects</h3>
      <p className="inbox-suggestions__description">Group related inbox items into projects:</p>
      <ul className="inbox-suggestions__list">
        {suggestions.slice(0, 3).map((s, idx) => (
          <li key={idx} className="inbox-suggestion-item">
            <div className="inbox-suggestion-item__header">
              <strong>{s.suggestedTitle}</strong>
              <span className="inbox-suggestion-item__count">{s.itemIds.length} items</span>
            </div>
            {s.description && <p className="inbox-suggestion-item__description">{s.description}</p>}
            <button
              className="inbox-suggestion-item__action"
              onClick={() => onCreateProject?.(s)}
              aria-label={`Create project: ${s.suggestedTitle}`}
            >
              Create Project
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
