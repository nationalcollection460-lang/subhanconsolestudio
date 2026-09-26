import { Router } from 'express';
import multer from 'multer';

import { many, one, q, getSettings, saveSettings, dollarParam } from '../db.js';
import {
  hashPassword,
  verifyPassword,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  publicAdmin,
  requireAdmin,
  findAdminByEmail,
} from '../auth.js';
import { uploadFile, storageEnabled, ALLOWED_TYPES } from '../storage.js';

const router = Router();

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only images (jpg, png, webp, gif, svg), PDF and archive (tar.gz, zip) files are allowed.'));
  },
});

/** Same as upload.single('file'), but turns multer errors into clear replies. */
function uploadSingle(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'That file is bigger than 25MB. Please choose a smaller photo (up to 25MB) or paste an image link instead.',
      });
    }
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload problem: ${err.message}` });
    }
    return res.status(err.status || 400).json({ error: err.message || 'Upload failed. Please try again.' });
  });
}

/* ------------------------------- auth -------------------------------- */

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim();
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const admin = await findAdminByEmail(email);
    const ok = admin ? await verifyPassword(password, admin.password_hash) : false;
    if (!ok) return res.status(401).json({ error: 'Email or password is not correct.' });

    await q('update admins set last_login_at = now() where id = $1', [admin.id]);
    const token = await signToken(admin);
    setAuthCookie(res, token);
    res.json({ admin: publicAdmin({ ...admin, last_login_at: new Date() }), token });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: publicAdmin(req.admin) });
});

router.put('/account', requireAdmin, async (req, res, next) => {
  try {
    const { current_password: currentPassword, email, password, name } = req.body || {};
    if (!currentPassword) return res.status(400).json({ error: 'Enter your current password to save changes.' });
    const ok = await verifyPassword(String(currentPassword), req.admin.password_hash);
    if (!ok) return res.status(400).json({ error: 'Your current password is not correct.' });

    const nextEmail = email ? String(email).trim().toLowerCase() : req.admin.email;
    const nextName = name ? String(name).trim().slice(0, 120) : req.admin.name;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      return res.status(400).json({ error: 'Please enter a valid Gmail / email address.' });
    }
    if (nextEmail !== req.admin.email) {
      const clash = await findAdminByEmail(nextEmail);
      if (clash) return res.status(400).json({ error: 'This email is already used by another admin.' });
    }
    let passwordHash = req.admin.password_hash;
    if (password) {
      const plain = String(password);
      if (plain.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      passwordHash = await hashPassword(plain);
    }

    const updated = await one(
      `update admins set email = $1, name = $2, password_hash = $3, updated_at = now() where id = $4 returning *`,
      [nextEmail, nextName, passwordHash, req.admin.id],
    );
    const token = await signToken(updated);
    setAuthCookie(res, token);
    res.json({ admin: publicAdmin(updated), message: 'Login details updated successfully.' });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------ uploads ------------------------------ */

router.post('/upload', requireAdmin, uploadSingle, async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please choose a file to upload.' });
    const folder = ['courses', 'jobs', 'services', 'ads', 'students', 'team'].includes(String(req.body?.folder))
      ? String(req.body.folder)
      : 'uploads';
    const result = await uploadFile({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
      folder,
    });
    res.status(201).json({ ok: true, url: result.url, key: result.key });
  } catch (err) {
    if (err.status === 503) return res.status(503).json({ error: err.message });
    next(err);
  }
});

router.get('/storage-status', requireAdmin, (_req, res) => {
  res.json({ storage: storageEnabled });
});

/* ----------------------------- dashboard ----------------------------- */

router.get('/stats', requireAdmin, async (_req, res, next) => {
  try {
    const counts = await one(`select
        (select count(*)::int from applications) as applications,
        (select count(*)::int from applications where status = 'new') as new_applications,
        (select count(*)::int from applications where created_at > now() - interval '7 days') as applications_week,
        (select count(*)::int from applications where kind = 'job') as job_applications,
        (select count(*)::int from applications where kind = 'course') as course_applications,
        (select count(*)::int from messages) as messages,
        (select count(*)::int from messages where handled = false) as new_messages,
        (select count(*)::int from courses) as courses,
        (select count(*)::int from jobs) as jobs,
        (select count(*)::int from services) as services,
        (select count(*)::int from students) as students,
        (select count(*)::int from ads) as ads,
        (select count(*)::int from categories) as categories`);

    const recentApplications = await many('select * from applications order by created_at desc limit 6');
    const recentMessages = await many('select * from messages order by created_at desc limit 6');
    res.json({ counts, recentApplications, recentMessages });
  } catch (err) {
    next(err);
  }
});

/* ---------------------------- applications --------------------------- */

router.get('/applications', requireAdmin, async (req, res, next) => {
  try {
    const params = [];
    let where = 'where 1=1';
    const status = String(req.query.status || '').trim();
    if (status && status !== 'all') {
      params.push(status);
      where += ` and status = $${params.length}`;
    }
    const kind = String(req.query.kind || '').trim();
    if (kind && kind !== 'all') {
      params.push(kind);
      where += ` and kind = $${params.length}`;
    }
    const search = String(req.query.q || '').trim();
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where += ` and (lower(name) like $${params.length} or lower(phone) like $${params.length} or lower(city) like $${params.length} or lower(interest) like $${params.length})`;
    }
    const rows = await q(`select * from applications ${where} order by created_at desc limit 500`, params);
    res.json({ applications: rows.rows });
  } catch (err) {
    next(err);
  }
});

router.put('/applications/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await one(
      'update applications set status = coalesce($1, status), notes = coalesce($2, notes), updated_at = now() where id = $3 returning *',
      [req.body?.status ? String(req.body.status) : null, req.body?.notes !== undefined ? String(req.body.notes) : null, id],
    );
    if (!row) return res.status(404).json({ error: 'Application not found.' });
    res.json({ application: row });
  } catch (err) {
    next(err);
  }
});

router.delete('/applications/:id', requireAdmin, async (req, res, next) => {
  try {
    await q('delete from applications where id = $1', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------ messages ----------------------------- */

router.get('/messages', requireAdmin, async (_req, res, next) => {
  try {
    const rows = await many('select * from messages order by created_at desc limit 500');
    res.json({ messages: rows });
  } catch (err) {
    next(err);
  }
});

router.put('/messages/:id', requireAdmin, async (req, res, next) => {
  try {
    const row = await one('update messages set handled = coalesce($1, handled) where id = $2 returning *', [
      typeof req.body?.handled === 'boolean' ? req.body.handled : null,
      Number(req.params.id),
    ]);
    if (!row) return res.status(404).json({ error: 'Message not found.' });
    res.json({ message: row });
  } catch (err) {
    next(err);
  }
});

router.delete('/messages/:id', requireAdmin, async (req, res, next) => {
  try {
    await q('delete from messages where id = $1', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------ settings ----------------------------- */

router.get('/settings', requireAdmin, async (_req, res, next) => {
  try {
    res.json({ settings: await getSettings() });
  } catch (err) {
    next(err);
  }
});

router.put('/settings', requireAdmin, async (req, res, next) => {
  try {
    const settings = await saveSettings(req.body || {});
    res.json({ settings, message: 'Website details saved.' });
  } catch (err) {
    next(err);
  }
});

/* --------------------------- generic content ------------------------- */

const RESOURCES = {
  courses: {
    table: 'courses',
    order: 'sort_order asc, id asc',
    required: ['title'],
    json: ['highlights'],
    ints: ['sort_order'],
    bools: ['active'],
    fields: ['title', 'category', 'summary', 'description', 'duration', 'fee', 'level', 'mode', 'highlights', 'image_url', 'badge', 'active', 'sort_order'],
  },
  jobs: {
    table: 'jobs',
    order: 'sort_order asc, id asc',
    required: ['title'],
    json: ['requirements'],
    ints: ['sort_order', 'positions'],
    bools: ['active', 'laptop'],
    fields: ['title', 'category', 'description', 'type', 'location', 'salary', 'positions', 'requirements', 'laptop', 'training', 'experience', 'badge', 'active', 'sort_order'],
  },
  services: {
    table: 'services',
    order: 'sort_order asc, id asc',
    required: ['title'],
    json: ['features'],
    ints: ['sort_order'],
    bools: ['active'],
    fields: ['title', 'category', 'description', 'icon', 'price', 'features', 'image_url', 'active', 'sort_order'],
  },
  ads: {
    table: 'ads',
    order: 'sort_order asc, id asc',
    required: ['title'],
    json: [],
    ints: ['sort_order'],
    bools: ['active'],
    fields: ['title', 'body', 'badge', 'image_url', 'link', 'link_label', 'placement', 'active', 'sort_order'],
  },
  students: {
    table: 'students',
    order: 'sort_order asc, id asc',
    required: ['name'],
    json: [],
    ints: ['sort_order'],
    bools: ['active', 'placed'],
    fields: ['name', 'course', 'batch', 'year', 'position', 'company', 'quote', 'photo_url', 'placed', 'active', 'sort_order'],
  },
  categories: {
    table: 'categories',
    order: 'kind asc, sort_order asc, id asc',
    required: ['name'],
    json: [],
    ints: ['sort_order'],
    bools: ['active'],
    fields: ['name', 'kind', 'icon', 'sort_order', 'active'],
  },
};

function sanitize(def, body = {}) {
  const values = {};
  for (const field of def.fields) {
    if (!(field in body)) continue;
    const raw = body[field];
    if (def.json.includes(field)) {
      const list = Array.isArray(raw)
        ? raw
        : String(raw || '')
            .split('\n')
            .map((v) => v.replace(/^[-•*\s]+/, '').trim());
      values[field] = JSON.stringify(list.filter(Boolean));
    } else if (def.ints.includes(field)) {
      const num = Number(raw);
      values[field] = Number.isFinite(num) ? Math.trunc(num) : 0;
    } else if (def.bools.includes(field)) {
      values[field] = raw === true || raw === 'true' || raw === 1 || raw === '1';
    } else {
      values[field] = String(raw ?? '').slice(0, 6000);
    }
  }
  return values;
}

function castFor(def, field) {
  if (def.json.includes(field)) return '::jsonb';
  if (def.ints.includes(field)) return '::int';
  if (def.bools.includes(field)) return '::boolean';
  return '';
}

function resourceOr404(name, res) {
  const def = RESOURCES[name];
  if (!def) {
    res.status(404).json({ error: 'Unknown section.' });
    return null;
  }
  return def;
}

async function listResource(def) {
  const rows = await q(`select * from ${def.table} order by ${def.order}`);
  return rows.rows;
}

router.get('/:resource', requireAdmin, async (req, res, next) => {
  try {
    const def = resourceOr404(req.params.resource, res);
    if (!def) return;
    res.json({ items: await listResource(def), resource: req.params.resource });
  } catch (err) {
    next(err);
  }
});

router.post('/:resource', requireAdmin, async (req, res, next) => {
  try {
    const def = resourceOr404(req.params.resource, res);
    if (!def) return;
    const values = sanitize(def, req.body || {});
    for (const field of def.required) {
      if (!values[field] || !String(values[field]).trim()) {
        return res.status(400).json({ error: `${field === 'name' ? 'Name' : 'Title'} is required.` });
      }
    }
    const keys = Object.keys(values);
    const placeholders = keys.map((k, i) => dollarParam(i + 1) + castFor(def, k)).join(', ');
    const row = await one(
      `insert into ${def.table} (${keys.join(', ')}) values (${placeholders}) returning *`,
      keys.map((k) => values[k]),
    );
    res.status(201).json({ item: row, message: 'Added successfully.' });
  } catch (err) {
    next(err);
  }
});

router.put('/:resource/:id', requireAdmin, async (req, res, next) => {
  try {
    const def = resourceOr404(req.params.resource, res);
    if (!def) return;
    const values = sanitize(def, req.body || {});
    const keys = Object.keys(values);
    if (!keys.length) return res.status(400).json({ error: 'Nothing to update.' });
    const sets = keys.map((k, i) => k + ' = ' + dollarParam(i + 1) + castFor(def, k)).join(', ');
    const params = keys.map((k) => values[k]);
    params.push(Number(req.params.id));
    const row = await one(
      `update ${def.table} set ${sets}${def.table === 'categories' ? '' : ', updated_at = now()'} where id = $${params.length} returning *`,
      params,
    );
    if (!row) return res.status(404).json({ error: 'Not found.' });
    res.json({ item: row, message: 'Saved successfully.' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:resource/:id', requireAdmin, async (req, res, next) => {
  try {
    const def = resourceOr404(req.params.resource, res);
    if (!def) return;
    await q(`delete from ${def.table} where id = $1`, [Number(req.params.id)]);
    res.json({ ok: true, message: 'Deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
