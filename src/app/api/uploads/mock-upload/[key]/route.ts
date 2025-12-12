import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

async function ensureUploadsDir() {
  const uploads = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploads, { recursive: true });
  } catch {}
  return uploads;
}

export async function PUT(request: Request, context: unknown) {
  const key = (context as { params?: { key?: string } })?.params?.key as string | undefined;
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const uploads = await ensureUploadsDir();
  // strip potential path traversal
  const safeKey = key.replace(/\.\.|\//g, "_");
  const outPath = path.join(uploads, safeKey);

  try {
    const buf = Buffer.from(await request.arrayBuffer());
    await fs.writeFile(outPath, buf);
    // Return the public URL where the file will be accessible via /uploads/<key>
    const publicUrl = `/uploads/${encodeURIComponent(safeKey)}`;
    return new NextResponse(JSON.stringify({ ok: true, url: publicUrl, key: safeKey }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(JSON.stringify({ error: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
