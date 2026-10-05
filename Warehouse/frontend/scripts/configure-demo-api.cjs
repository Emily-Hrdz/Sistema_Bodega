// API URL is public configuration, not a database connection or a secret.
const { writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const value = process.env.API_BASE_URL;
if (!value) throw new Error('Configure la variable de GitHub API_BASE_URL con la URL HTTPS del backend terminada en /api.');
const url = new URL(value);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !url.pathname.replace(/\/$/, '').endsWith('/api')) {
  throw new Error('API_BASE_URL debe ser HTTPS, terminar en /api y no incluir credenciales, query ni fragmentos.');
}
writeFileSync(resolve(__dirname, '../src/environments/environment.prod.ts'),
  `export const environment = ${JSON.stringify({ production: true, apiUrl: value.replace(/\/$/, '') }, null, 2)};\n`);
