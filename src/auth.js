import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { one, getJwtSecret } from './db.js';

const COOKIE_NAME = 'scs_admin';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days

export function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export async function signToken(admin) {
  const secret = await getJwtSecret();
  return jwt.sign({ sub: admin.id, email: admin.email }, secret, { expiresIn: '7d' });
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export function readToken(req) {
  const fromCookie = req.cookies?.[COOKIE_NAME];
  if (fromCookie) return fromCookie;
  const header = req.headers?.authorization || '';
  if (header.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  return null;
}

export function publicAdmin(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    created_at: row.created_at,
    last_login_at: row.last_login_at,
  };
}

export async function requireAdmin(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) return res.status(401).json({ error: 'Please sign in to continue.' });
    const secret = await getJwtSecret();
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Your session expired. Please sign in again.' });
    }
    const admin = await one('select * from admins where id = $1', [payload.sub]);
    if (!admin) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'This admin account no longer exists.' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}

export async function findAdminByEmail(email) {
  return one('select * from admins where lower(email) = lower($1)', [String(email || '').trim()]);
}
