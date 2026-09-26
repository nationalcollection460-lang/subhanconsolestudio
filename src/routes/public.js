import { Router } from 'express';

import { many, one, q, getSettings } from '../db.js';
import { buildContext, chatReply, waLink } from '../ai.js';

const router = Router();

/* ------------------------------ helpers ------------------------------ */

const buckets = new Map();

function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return false;
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

function clientKey(req) {
  return String(req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0].trim();
}

function toArray(value) {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value
      .split('\n')
      .map((v) => v.replace(/^[-•*\s]+/, '').trim())
      .filter(Boolean);
  }
  return [];
}

function cleanText(value, max = 4000) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, max);
}

function phoneOk(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

/* ------------------------------- routes ------------------------------ */

router.get('/site', async (_req, res, next) => {
  try {
    const [settings, ads, catRows, counts] = await Promise.all([
      getSettings(),
      many('select id, title, body, badge, image_url, link, link_label, placement from ads where active = true order by sort_order, id'),
      many('select name, kind, icon from categories where active = true order by kind, sort_order, id'),
      one(`select
            (select count(*)::int from courses where active = true) as courses,
            (select count(*)::int from jobs where active = true) as jobs,
            (select count(*)::int from services where active = true) as services,
            (select count(*)::int from students where active = true) as students,
            (select count(*)::int from applications) as applications`),
    ]);

    res.json({
      settings,
      ads,
      categories: {
        all: catRows,
        course: catRows.filter((c) => c.kind === 'course').map((c) => c.name),
        job: catRows.filter((c) => c.kind === 'job').map((c) => c.name),
        service: catRows.filter((c) => c.kind === 'service').map((c) => c.name),
      },
      counts,
      links: {
        whatsapp: waLink(settings.whatsapp, settings.whatsapp_message),
        maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.map_query || settings.address)}`,
        call: `tel:${String(settings.phone || '').replace(/\s/g, '')}`,
        email: `mailto:${settings.email}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

const PUBLIC_COLUMNS = {
  courses: 'id, title, category, summary, description, duration, fee, level, mode, highlights, image_url, badge, active, sort_order',
  jobs: 'id, title, category, description, type, location, salary, positions, requirements, laptop, training, experience, badge, active, sort_order',
  services: 'id, title, category, description, icon, price, features, image_url, active, sort_order',
  students: 'id, name, course, batch, year, position, company, quote, photo_url, placed, active, sort_order',
  ads: 'id, title, body, badge, image_url, link, link_label, placement, active, sort_order',
};

router.get('/courses', async (req, res, next) => {
  try {
    const params = [];
    let where = 'where active = true';
    if (cleanText(req.query.category, 120)) {
      params.push(cleanText(req.query.category, 120));
      where += ` and category = $${params.length}`;
    }
    const rows = await q(`select ${PUBLIC_COLUMNS.courses} from courses ${where} order by sort_order, id`, params);
    res.json({ courses: rows.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/jobs', async (req, res, next) => {
  try {
    const params = [];
    let where = 'where active = true';
    if (cleanText(req.query.category, 120)) {
      params.push(cleanText(req.query.category, 120));
      where += ` and category = $${params.length}`;
    }
    const rows = await q(`select ${PUBLIC_COLUMNS.jobs} from jobs ${where} order by sort_order, id`, params);
    res.json({ jobs: rows.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/services', async (req, res, next) => {
  try {
    const rows = await q(`select ${PUBLIC_COLUMNS.services} from services where active = true order by sort_order, id`);
    res.json({ services: rows.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/students', async (req, res, next) => {
  try {
    const rows = await q(`select ${PUBLIC_COLUMNS.students} from students where active = true order by sort_order, id`);
    res.json({ students: rows.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/ads', async (req, res, next) => {
  try {
    const rows = await q(`select ${PUBLIC_COLUMNS.ads} from ads where active = true order by sort_order, id`);
    res.json({ ads: rows.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/applications', async (req, res, next) => {
  try {
    if (!rateLimit(`apply:${clientKey(req)}`, 10, 10 * 60 * 1000)) {
      return res.status(429).json({ error: 'Too many applications from this device. Please try again later or WhatsApp us.' });
    }
    const body = req.body || {};
    const name = cleanText(body.name, 120);
    const phone = cleanText(body.phone, 30);
    const kind = ['job', 'course', 'service', 'other'].includes(body.kind) ? body.kind : 'job';

    if (name.length < 2) return res.status(400).json({ error: 'Please enter your full name.' });
    if (!phoneOk(phone)) return res.status(400).json({ error: 'Please enter a correct mobile number (11 digits).' });

    const row = await one(
      `insert into applications (name, phone, email, city, kind, interest, experience, message)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning id, created_at`,
      [
        name,
        phone,
        cleanText(body.email, 160),
        cleanText(body.city, 120),
        kind,
        cleanText(body.interest, 200),
        cleanText(body.experience, 200),
        cleanText(body.message, 2000),
      ],
    );
    res.status(201).json({ ok: true, id: row.id });
  } catch (err) {
    next(err);
  }
});

router.post('/messages', async (req, res, next) => {
  try {
    if (!rateLimit(`msg:${clientKey(req)}`, 10, 10 * 60 * 1000)) {
      return res.status(429).json({ error: 'Too many messages from this device. Please try again later.' });
    }
    const body = req.body || {};
    const name = cleanText(body.name, 120);
    const message = cleanText(body.message, 2000);
    if (name.length < 2) return res.status(400).json({ error: 'Please enter your name.' });
    if (message.length < 5) return res.status(400).json({ error: 'Please write your message.' });

    const row = await one(
      'insert into messages (name, phone, email, subject, message) values ($1,$2,$3,$4,$5) returning id, created_at',
      [name, cleanText(body.phone, 30), cleanText(body.email, 160), cleanText(body.subject, 160), message],
    );
    res.status(201).json({ ok: true, id: row.id });
  } catch (err) {
    next(err);
  }
});

router.post('/chat', async (req, res, next) => {
  try {
    if (!rateLimit(`chat:${clientKey(req)}`, 40, 5 * 60 * 1000)) {
      return res.status(429).json({ error: 'Bohat zyada messages. Please WhatsApp us: 03003440200' });
    }
    const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
    const lastUser = [...messages].reverse().find((m) => m?.role === 'user');
    if (!lastUser || !cleanText(lastUser.content, 10)) {
      return res.status(400).json({ error: 'Please type a question.' });
    }

    const ctx = await buildContext();
    const started = Date.now();
    const result = await chatReply(messages, ctx);
    const settings = ctx.settings;

    res.json({
      reply: result.reply,
      suggestions: result.suggestions || [],
      source: result.source,
      took_ms: Date.now() - started,
      whatsapp: waLink(settings.whatsapp, settings.whatsapp_message),
      agent: 'Subhan Console Studio Assistant',
      hours: 'Online 24/7',
    });
  } catch (err) {
    next(err);
  }
});

router.get('/track/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid reference number.' });
    const row = await one(
      'select id, name, kind, interest, status, created_at from applications where id = $1',
      [id],
    );
    if (!row) return res.status(404).json({ error: 'No application found with this number.' });
    res.json({ application: row });
  } catch (err) {
    next(err);
  }
});

export default router;
