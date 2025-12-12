import fs from "fs/promises";
import path from "path";
import { analyzeParaCapture } from "../src/lib/ai";

async function main() {
  const filename = "test.jpg";
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const safeKey = key.replace(/\.\.|\//g, "_");
  const outPath = path.join(uploadsDir, safeKey);

  await fs.writeFile(outPath, Buffer.from("mock-image-bytes"));

  const publicUrl = `http://localhost:3000/uploads/${encodeURIComponent(safeKey)}`;
  const text = "E2E mock upload test: schedule planning meeting";

  console.log("Wrote mock file:", outPath);

  try {
    let decision;
    if (process.env.OPENAI_API_KEY) {
      decision = await analyzeParaCapture({ text, imageUrl: publicUrl });
    } else {
      // Local/dev fallback: mocked classification when no API key is present
      decision = {
        classification: "INBOX",
        title: text.slice(0, 80),
        details: text,
        type: "NOTE",
      };
    }
    console.log(JSON.stringify({ ok: true, key: safeKey, publicUrl, decision }, null, 2));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("analyzeParaCapture failed:", msg);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
