"use client";

import { useMemo } from "react";

/**
 * Fuzzy search utility with Levenshtein distance
 * Returns a score (0-1) where 1 is exact match, 0 is no match
 */
function fuzzyMatch(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match
  if (textLower === queryLower) return 1;

  // Starts with query
  if (textLower.startsWith(queryLower)) return 0.9;

  // Contains query
  if (textLower.includes(queryLower)) return 0.7;

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(queryLower, textLower);
  const maxLength = Math.max(queryLower.length, textLower.length);
  const similarity = 1 - distance / maxLength;

  // Boost score if words match in order
  const queryWords = queryLower.split(/\s+/);
  const textWords = textLower.split(/\s+/);
  let wordOrderScore = 0;
  let queryIdx = 0;

  for (const textWord of textWords) {
    if (queryIdx < queryWords.length && textWord.includes(queryWords[queryIdx])) {
      wordOrderScore += 1 / queryWords.length;
      queryIdx++;
    }
  }

  return Math.max(similarity * 0.5, wordOrderScore * 0.3);
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

type FuzzySearchProps<T> = {
  items: T[];
  query: string;
  searchFields: (keyof T)[];
  minScore?: number;
  maxResults?: number;
};

export function useFuzzySearch<T extends Record<string, unknown>>({
  items,
  query,
  searchFields,
  minScore = 0.3,
  maxResults = 50,
}: FuzzySearchProps<T>) {
  const results = useMemo(() => {
    // Early return if no query
    if (!query?.trim()) {
      return items;
    }

    // Validate inputs
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    if (!Array.isArray(searchFields) || searchFields.length === 0) {
      console.warn("useFuzzySearch: No search fields provided");
      return items; // Return all items if no fields specified
    }

    const queryLower = query.trim().toLowerCase();
    
    // Early return for very short queries
    if (queryLower.length < 1) {
      return items;
    }

    try {
      const scored = items.map((item, index) => {
        let maxScore = 0;

        for (const field of searchFields) {
          try {
            const fieldValue = item[field];
            
            // Handle different value types
            if (fieldValue === null || fieldValue === undefined) {
              continue;
            }

            let searchableText = "";
            if (typeof fieldValue === "string") {
              searchableText = fieldValue;
            } else if (typeof fieldValue === "number") {
              searchableText = String(fieldValue);
            } else if (typeof fieldValue === "boolean") {
              searchableText = fieldValue ? "true" : "false";
            } else if (Array.isArray(fieldValue)) {
              // Join array values
              searchableText = fieldValue
                .filter((v) => v !== null && v !== undefined)
                .map((v) => String(v))
                .join(" ");
            } else if (typeof fieldValue === "object") {
              // Try to stringify objects (be careful with circular refs)
              try {
                searchableText = JSON.stringify(fieldValue);
              } catch {
                continue; // Skip objects that can't be stringified
              }
            } else {
              searchableText = String(fieldValue);
            }

            if (searchableText) {
              const score = fuzzyMatch(queryLower, searchableText.toLowerCase());
              maxScore = Math.max(maxScore, score);
            }
          } catch (error) {
            console.warn(`Error searching field ${String(field)} in item ${index}:`, error);
            continue;
          }
        }

        return { item, score: maxScore };
      });

      return scored
        .filter(({ score }) => score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(1, maxResults)) // Ensure at least 1 result if there are matches
        .map(({ item }) => item);
    } catch (error) {
      console.error("Fuzzy search error:", error);
      // Fallback to simple string matching on first field
      const firstField = searchFields[0];
      if (firstField) {
        return items.filter((item) => {
          const value = item[firstField];
          return value && typeof value === "string" && value.toLowerCase().includes(queryLower);
        }).slice(0, maxResults);
      }
      return [];
    }
  }, [items, query, searchFields, minScore, maxResults]);

  return results;
}
