import safeFetchUrlChecked from './safe-fetch-url';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function validateAndFetchImage(imageUrl: string): Promise<{ mimeType: string; base64: string } | null> {
  try {
    const response = await safeFetchUrlChecked(imageUrl, {
      headers: { Accept: 'image/*' },
      timeoutMs: 10000,
    } as any);

    if (!response.ok) {
      console.warn(`Image fetch failed: ${response.status} for ${imageUrl}`);
      return null;
    }

    const contentType = response.headers.get('content-type')?.split(';')[0].toLowerCase() || '';
    if (!ALLOWED_IMAGE_TYPES.some(t => contentType.includes(t))) {
      console.warn(`Unsupported image type: ${contentType}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_SIZE) {
      console.warn(`Image size exceeds limit: ${buffer.byteLength} bytes`);
      return null;
    }

    const base64 = Buffer.from(buffer).toString('base64');
    return { mimeType: contentType || 'image/jpeg', base64 };
  } catch (e) {
    console.warn(`Image validation error: ${(e as Error).message || e}`);
    return null;
  }
}

export default validateAndFetchImage;
