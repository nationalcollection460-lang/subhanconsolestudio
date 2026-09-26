import fs from 'node:fs';
import path from 'node:path';

/**
 * Load KEY=value pairs from the project's env files (.env.mythex is the file the
 * platform writes for the project; a container gets real env vars instead).
 * Real process env always wins, and values are never logged.
 */
const FILES = ['.env.mythex', '.env.local', '.env'];

export function loadEnvFiles() {
  for (const file of FILES) {
    try {
      const full = path.resolve(process.cwd(), file);
      if (!fs.existsSync(full)) continue;
      const text = fs.readFileSync(full, 'utf8');
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
        if (process.env[key] !== undefined && process.env[key] !== '') continue;
        let value = trimmed.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    } catch (err) {
      console.warn(`[env] could not read ${file}: ${err.code || err.message}`);
    }
  }
}

loadEnvFiles();

/** Names of the env keys this service cares about — never their values. */
export function envKeyNames() {
  return Object.keys(process.env)
    .filter((key) => /^(DATABASE|STORAGE|S3|AWS|OPENAI|ADMIN|JWT|PORT|NODE_ENV)/.test(key))
    .sort();
}
