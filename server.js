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

app.get('/api/health', (_req, res) => {
  const db = getDbStatus();
  res.json({
    ok: true,
    service: 'subhan-console-studio-api',
    time: new Date().toISOString(),
    db: { configured: db.configured, ready: db.ready, error: process.env.NODE_ENV === 'production' ? undefined : db.error },
    env_keys: process.env.NODE_ENV === 'production' ? undefined : envKeyNames(),
  });
});

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

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

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
