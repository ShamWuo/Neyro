import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Keep this file lightweight. It returns a presigned PUT URL for direct-to-S3 uploads.
// Required env vars: S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({} as unknown))) as Record<string, unknown>;
  const filename = String(body.filename ?? body.key ?? "upload.bin");
  const contentType = String(body.contentType ?? "application/octet-stream");

  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION;

  // If S3 is configured, attempt to generate a real presigned URL.
  if (bucket && region) {
    try {
      // Dynamically import AWS SDK to avoid requiring it if not installed in some environments
      // Dynamic import; if AWS SDK isn't installed we'll gracefully fall back to the mock presign.
      // @ts-expect-error - allow runtime import to fail in environments without the AWS SDK installed.
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      // @ts-expect-error - s3-request-presigner may not be present in some dev environments.
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const client = new S3Client({ region });
      const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
      const url = await getSignedUrl(client, cmd, { expiresIn: 300 }); // 5 minutes

      return new NextResponse(JSON.stringify({ ok: true, url, key }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Fall through to mock presign below for dev convenience
      console.warn("S3 presign failed, falling back to mock presign:", msg);
    }
  }

  // Dev fallback: return a mock upload URL that PUTs back to the app itself.
  const mockKey = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const mockUrl = `/api/uploads/mock-upload/${encodeURIComponent(mockKey)}`;
  return new NextResponse(JSON.stringify({ ok: true, url: mockUrl, key: mockKey, mock: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}
