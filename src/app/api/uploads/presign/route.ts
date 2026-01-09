import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// Keep this file lightweight. It returns a presigned PUT URL for direct-to-S3 uploads.
// Required env vars: S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  const filename = String(body.filename ?? body.key ?? "upload.bin");
  const contentType = String(body.contentType ?? "application/octet-stream");

  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION;

  // If S3 is configured, attempt to generate a real presigned URL.
  if (bucket && region) {
    try {
      // Dynamically import AWS SDK to avoid requiring it if not installed in some environments
      // Dynamic import; if AWS SDK isn't installed we'll gracefully fall back to the mock presign.
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

      if (!accessKeyId || !secretAccessKey) {
        throw new Error("AWS credentials not configured");
      }

      const client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
      const url = await getSignedUrl(client, cmd, { expiresIn: 300 }); // 5 minutes

      return new NextResponse(JSON.stringify({ ok: true, url, key }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Fall through to mock presign below for dev convenience
      logger.warn("S3 presign failed, falling back to mock presign", { message: msg });
    }
  }

  // Dev fallback: return a mock upload URL that PUTs back to the app itself.
  const mockKey = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const mockUrl = `/api/uploads/mock-upload/${encodeURIComponent(mockKey)}`;
  return new NextResponse(JSON.stringify({ ok: true, url: mockUrl, key: mockKey, mock: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}
