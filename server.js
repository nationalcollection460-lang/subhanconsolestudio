import { envKeyNames } from './src/env.js'; // must stay first: fills process.env
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { ensureReady, getDbStatus } from './src/db.js';
import publicRoutes from './src/routes/public.js';
import adminRoutes from './src/routes/admin.js';

const app = express();
app.disable('x-powered-by');

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: true, credentials: true }));
}

function healthPayload() {
  const db = getDbStatus();
  return {
    ok: true,
    service: 'subhan-console-studio-api',
    time: new Date().toISOString(),
    db: { configured: db.configured, ready: db.ready, error: process.env.NODE_ENV === 'production' ? undefined : db.error },
    env_keys: process.env.NODE_ENV === 'production' ? undefined : envKeyNames(),
  };
}

/** The website's own address, kept current by the platform (never hard-coded). */
function siteOrigin() {
  const raw = String(process.env.MYTHEX_WEB_ORIGIN || process.env.CORS_ORIGIN || '').split(',')[0].trim();
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
}

/** Opening this service's own address should look deliberate, not broken. */
function servicePage() {
  const site = siteOrigin();
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Subhan Console Studio &#8212; service is running</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #05060f; color: #e2e8f0;
             font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
      main { max-width: 34rem; padding: 2rem; text-align: center; }
      h1 { font-size: 1.35rem; margin: 0 0 .75rem; }
      p { color: #94a3b8; line-height: 1.6; margin: 0 0 1rem; }
      a { color: #67e8f9; }
      .links { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1.25rem; }
      .dot { display: inline-block; width: .5rem; height: .5rem; border-radius: 999px; background: #34d399; margin-right: .5rem; }
    </style>
  </head>
  <body>
    <main>
      <h1><span class="dot"></span>Subhan Console Studio &#8212; service is running</h1>
      <p>
        This address is the behind-the-scenes service that powers the website (courses, jobs, applications and the
        chat assistant). It is not the website itself.
      </p>
      <div class="links">
        ${site ? `<a href="${site}">Go to the website</a>` : ''}
        <a href="/api/health">Service status</a>
      </div>
    </main>
  </body>
</html>`;
}

app.get(['/api/health', '/health', '/api', '/api/'], (_req, res) => res.json(healthPayload()));

app.get('/', (_req, res) => res.status(200).type('html').send(servicePage()));

// Make sure the database schema + seed exist before any data route runs.
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();
  try {
    await ensureReady();
    next();
  } catch (err) {
    console.error('[db] init failed:', err.message);
    res.status(503).json({ error: 'The site database is starting up. Please try again in a few seconds.' });
  }
});

app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// Anything under /api that we do not know about is a real API 404 (for the app's own calls).
app.use((req, res) => {
  if (req.path === '/api' || req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'This API path does not exist.', hint: 'Service status is at /api/health' });
  }
  // Every other address is not part of this service: answer with the friendly page.
  res.status(404).type('html').send(servicePage());
});

app.use((err, _req, res, _next) => {
  if (err && (err.code === 'LIMIT_FILE_SIZE' || err.type === 'entity.too.large')) {
    return res.status(413).json({
      error: 'That file is bigger than 25MB. Please choose a smaller photo (up to 25MB) or paste an image link instead.',
    });
  }
  const status = err.status || 500;
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({ error: err.message || 'Something went wrong' });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, '0.0.0.0', () => {
  console.log(`Subhan Console Studio API listening on port ${port}`);
});
