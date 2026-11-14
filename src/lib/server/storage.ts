import { Storage } from "@google-cloud/storage";

let storageInstance: Storage | null = null;

export function getStorageClient(): Storage {
  if (!storageInstance) {
    const projectId = process.env.GCP_PROJECT_ID || "papertale-studio";
    const rawSa = process.env.GCP_SERVICE_ACCOUNT_JSON;
    let credentials: { client_email?: string; private_key?: string } | undefined;
    if (rawSa) {
      try {
        const parsed = JSON.parse(rawSa);
        credentials = {
          client_email: parsed.client_email,
          private_key: typeof parsed.private_key === "string"
            ? parsed.private_key.replace(/\\n/g, "\n")
            : undefined,
        };
      } catch (err) {
        console.error("Failed to parse GCP_SERVICE_ACCOUNT_JSON for GCS:", err);
      }
    }
    storageInstance = new Storage({
      projectId,
      ...(credentials?.client_email && credentials?.private_key ? { credentials } : {}),
    });
  }
  return storageInstance;
}

export function getBucketName(): string {
  return (
    process.env.GCS_BUCKET ||
    `${process.env.GCP_PROJECT_ID || "papertale-studio"}-assets`
  );
}

export const ONE_HOUR_SECONDS = 3600;
export const SEVEN_DAYS_SECONDS = 7 * 24 * 3600;

export function parseDataUrl(dataUrl: string): { buffer: Buffer; contentType: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return null;
  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

export async function uploadBuffer(
  objectPath: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const file = getStorageClient().bucket(getBucketName()).file(objectPath);
  await file.save(buffer, {
    resumable: false,
    contentType,
    metadata: {
      cacheControl: "private, max-age=3600",
    },
  });
  return objectPath;
}

export async function readBuffer(objectPath: string): Promise<Buffer> {
  const file = getStorageClient().bucket(getBucketName()).file(objectPath);
  const [bytes] = await file.download();
  return bytes;
}

export async function objectExists(objectPath: string): Promise<boolean> {
  const file = getStorageClient().bucket(getBucketName()).file(objectPath);
  const [exists] = await file.exists();
  return exists;
}

export async function deleteObject(objectPath: string): Promise<void> {
  const file = getStorageClient().bucket(getBucketName()).file(objectPath);
  await file.delete({ ignoreNotFound: true });
}

export async function getSignedReadUrl(
  objectPath: string,
  expiresInSeconds: number = ONE_HOUR_SECONDS
): Promise<string> {
  const cappedSeconds = Math.min(expiresInSeconds, SEVEN_DAYS_SECONDS);
  const file = getStorageClient().bucket(getBucketName()).file(objectPath);
  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + cappedSeconds * 1000,
  });
  return url;
}
