// Render-only startup. Does not load the developer's local .env.
const { spawnSync, spawn } = require('node:child_process');
const { resolve } = require('node:path');

function configuration(env) {
  if (env.RENDER !== 'true') throw new Error('Este comando es exclusivo de Render; use start:dev en local.');
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) throw new Error('Configure JWT_SECRET con al menos 32 caracteres.');
  let database;
  try { database = new URL(env.DATABASE_URL); } catch { throw new Error('Configure DATABASE_URL en Render.'); }
  if (!['postgresql:', 'postgres:'].includes(database.protocol) || !database.hostname.endsWith('.neon.tech')) {
    throw new Error('El arranque de esta demo requiere una base Neon, nunca la base local.');
  }
  // Neon exposes the corresponding direct endpoint without the -pooler suffix.
  // Keep the pooled URL for the application, use direct for Prisma migrations.
  const direct = new URL(database);
  direct.hostname = direct.hostname.replace('-pooler.', '.');
  return { ...env, NODE_ENV: 'production', DIRECT_DATABASE_URL: direct.toString() };
}

async function main() {
  const env = configuration(process.env);
  const migration = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], {
    cwd: resolve(__dirname, '..'), env: { ...env, DATABASE_URL: env.DIRECT_DATABASE_URL }, stdio: 'inherit',
  });
  if (migration.error || migration.status !== 0) throw new Error('No se pudo aplicar las migraciones; el servidor no se iniciará.');
  if (env.SEED_DEMO === 'true') {
    const seed = spawnSync(process.execPath, [resolve(__dirname, 'seed-cloud-demo.cjs')], { env, stdio: 'inherit' });
    if (seed.error || seed.status !== 0) throw new Error('No se pudo preparar los datos de demostración.');
  }
  const server = spawn(process.execPath, [resolve(__dirname, '../dist/main.js')], { env, stdio: 'inherit' });
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.kill(signal));
  server.on('error', () => { process.exitCode = 1; });
  server.on('exit', code => { process.exitCode = code ?? 1; });
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { configuration };
