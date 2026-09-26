import crypto from 'node:crypto';
import path from 'node:path';

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

function pick(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && String(value).trim()) return String(value).trim();
  }
  return '';
}

const config = {
  endpoint: pick('STORAGE_ENDPOINT', 'S3_ENDPOINT', 'AWS_ENDPOINT_URL_S3', 'AWS_ENDPOINT_URL'),
  region: pick('STORAGE_REGION', 'AWS_REGION', 'AWS_DEFAULT_REGION') || 'auto',
  bucket: pick('STORAGE_BUCKET', 'S3_BUCKET', 'BUCKET_NAME', 'AWS_BUCKET'),
  accessKeyId: pick('STORAGE_ACCESS_KEY_ID', 'S3_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID', 'STORAGE_ACCESS_KEY'),
  secretAccessKey: pick('STORAGE_SECRET_ACCESS_KEY', 'S3_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY', 'STORAGE_SECRET_KEY'),
  prefix: pick('STORAGE_PREFIX', 'S3_PREFIX'),
  publicUrl: pick('STORAGE_PUBLIC_URL', 'S3_PUBLIC_URL'),
};

export const storageEnabled = Boolean(config.bucket && config.accessKeyId && config.secretAccessKey);

let client = null;

function getClient() {
  if (!client) {
    const clientConfig = {
      region: config.region,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    };
    // The platform storage endpoint is optional: with AWS S3 the SDK resolves it
    // itself, with an S3-compatible service the endpoint is provided.
    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = String(process.env.STORAGE_FORCE_PATH_STYLE || '').toLowerCase() === 'true';
    }
    client = new S3Client(clientConfig);
  }
  return client;
}

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'application/gzip': 'tar.gz',
  'application/x-gzip': 'tar.gz',
  'application/zip': 'zip',
};

export const ALLOWED_TYPES = Object.keys(EXTENSIONS);

export function publicUrlFor(key) {
  if (!key) return '';
  if (!config.publicUrl) return key;
  return `${config.publicUrl.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}

/**
 * Upload a file to the project's object storage.
 * Files always live under STORAGE_PREFIX (a plain path prefix, not an s3:// URL).
 */
export async function uploadFile({ buffer, mimetype, originalname, folder = 'uploads' }) {
  if (!storageEnabled) {
    const err = new Error(
      'File uploads are not switched on for this project. Paste an image link instead, or ask me to enable uploads.',
    );
    err.status = 503;
    throw err;
  }

  const ext = EXTENSIONS[mimetype] || (path.extname(originalname || '').replace('.', '') || 'bin').toLowerCase();
  const safeFolder = String(folder || 'uploads').replace(/[^a-z0-9/_-]/gi, '').replace(/^\/+|\/+$/g, '') || 'uploads';
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;

  const parts = [config.prefix, safeFolder, name].filter((p) => p && String(p).trim());
  const key = parts.join('/').replace(/\/{2,}/g, '/').replace(/^\//, '');

  await getClient().send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype || 'application/octet-stream',
    }),
  );

  return { key, url: publicUrlFor(key) };
}

export async function deleteFile(key) {
  if (!storageEnabled || !key) return false;
  try {
    await getClient().send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key.replace(/^\//, '') }));
    return true;
  } catch (err) {
    console.error('[storage] delete failed:', err.message);
    return false;
  }
}
