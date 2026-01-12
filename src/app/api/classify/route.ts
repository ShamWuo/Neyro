import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { analyzeParaCaptureSafe } from "@/lib/ai-safe";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text" }, { status: 400 });
    }

    // Try AI classification first (sanitized via ai-safe), fallback to heuristic
    let classification;
    try {
      const decision = await analyzeParaCaptureSafe({ text });
      classification = {
        category: (decision.classification || "INBOX").toLowerCase(),
        title: decision.title || (text.substring(0, 50) || ""),
        explanation: decision.details ? String(decision.details).slice(0, 100) : "AI classified item",
      };
      console.info("[CLASSIFY] AI classification via ai-safe:", classification);
    } catch (error) {
      console.warn("[CLASSIFY] AI failed or not configured, using heuristic fallback:", (error as Error)?.message || error);
      classification = classifyIntoPARA(text);
    }

    return NextResponse.json(classification);
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json({ error: "Classification failed" }, { status: 500 });
  }
}



function classifyIntoPARA(text: string): {
  category: "project" | "area" | "resource" | "archive";
  title: string;
  explanation: string;
} {
  const lower = text.toLowerCase();

  // Detect deadline/project keywords
  if (
    /deadline|due|finish|complete|deliver|ship|submit|launch|end by|by \d+\/|by next|by end of/.test(
      lower
    )
  ) {
    const title = extractTitle(text);
    return {
      category: "project",
      title: title || "Untitled project",
      explanation: "Detected deadline or completion goal → Project",
    };
  }

  // Detect area keywords (ongoing, maintain, keep, standard)
  if (
    /maintain|keep|standard|health|fitness|finances|career|family|home|exercise|work out|study|practice|improve/.test(
      lower
    )
  ) {
    const title = extractTitle(text);
    return {
      category: "area",
      title: title || "Untitled area",
      explanation: "Ongoing responsibility without deadline → Area",
    };
  }

  // Detect resource keywords (interest, reference, idea, learn, explore, idea)
  if (
    /idea|resource|learn|explore|research|article|tutorial|guide|reference|topic|interesting|save for|check out|look into/.test(
      lower
    )
  ) {
    const title = extractTitle(text);
    return {
      category: "resource",
      title: title || "Untitled resource",
      explanation: "Reference material or interest → Resource",
    };
  }

  // Default to project if it has urgency; area if general
  if (/urgent|asap|important|high priority|critical/.test(lower)) {
    const title = extractTitle(text);
    return {
      category: "project",
      title: title || "Untitled project",
      explanation: "Marked urgent → Project",
    };
  }

  // Default: Area (safe fallback for ongoing stuff)
  const title = extractTitle(text);
  return {
    category: "area",
    title: title || "Untitled area",
    explanation: "Default classification → Area",
  };
}

function extractTitle(text: string): string {
  // Get first line or first 50 chars
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return "";
  const first = lines[0].trim();
  return first.substring(0, 100);
}
