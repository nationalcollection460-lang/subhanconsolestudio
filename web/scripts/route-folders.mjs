/**
 * The website is a single-page app: one index.html answers every route.
 *
 * Plain addresses like /courses work on their own, but an address with a
 * trailing slash (/courses/) is read as a folder, so static hosting looks for
 * /courses/index.html and answers "not found" when it is missing.
 *
 * This writes a copy of index.html into a folder per route, so both spellings
 * of a link open the site. It runs as part of `npm run build`.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, '..', 'dist');

const ROUTES = [
  'courses',
  'jobs',
  'services',
  'students',
  'about',
  'contact',
  'apply',
  'admin',
  'admin/login',
  'admin/applications',
  'admin/messages',
  'admin/courses',
  'admin/jobs',
  'admin/services',
  'admin/ads',
  'admin/students',
  'admin/categories',
  'admin/settings',
  'admin/account',
];

const shell = await readFile(path.join(distDir, 'index.html'), 'utf8');

for (const route of ROUTES) {
  const dir = path.join(distDir, route);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), shell);
}

console.log(`route folders: wrote ${ROUTES.length} page shells into dist/`);
