S3 Direct Uploads (Mobile)

1) Server: presign

- POST `/api/uploads/presign` with JSON `{ "filename": "photo.jpg", "contentType": "image/jpeg" }`.
- Response: `{ ok: true, url: "https://...", key: "uploads/....jpg" }`.

2) Client: upload

- Use the returned `url` to `PUT` the file bytes directly to S3 (5 minute expiry). Example (fetch):

```js
await fetch(presign.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
```

3) Client: inform ingest API

- After successful upload, call your ingest endpoint and include `imageUrl` set to the public S3 URL for the object:

`https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{key}`

Example form POST to `/api/assist/ingest`:

```
form.append('text', 'Note about this photo');
form.append('imageUrl', 'https://my-bucket.s3.us-west-2.amazonaws.com/uploads/....jpg');
```

Notes:
- For private buckets, you can still use the object key URL and pass a short-lived signed GET URL to the AI backend, or make the object public-read if appropriate for your app.
- In production, use IAM roles and secure environment variables; rotate AWS keys regularly.
- Consider using multipart upload for very large files.

Dev mock flow (no AWS required):

- If `S3_BUCKET`/`S3_REGION` are not configured, the server responds to `/api/uploads/presign` with a `mock: true` response and a `url` that points to a local PUT endpoint like `/api/uploads/mock-upload/<key>`.
- PUT the file bytes to that URL; the server will store the file in `public/uploads/<key>` and return a public URL `/uploads/<key>` you can pass as `imageUrl` to `/api/assist/ingest`.

