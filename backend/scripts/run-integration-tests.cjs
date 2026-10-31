const path = require('node:path');
const { spawnSync } = require('node:child_process');
const dotenv = require('dotenv');

const backendDir = path.resolve(__dirname, '..');
const envPath = path.join(backendDir, '.env.test');
const result = dotenv.config({ path: envPath, override: true, quiet: true });

if (result.error) {
  console.error('Configure backend/.env.test antes de executar testes de integração.');
  process.exit(1);
}

const normalizeDatabaseUrl = (url) => {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === 'postgres' || host === 'hortifruti_db' || host === 'hortifruti_db.localhost') {
      parsed.hostname = '127.0.0.1';
      parsed.port = '5432';
      const normalized = parsed.toString();
      process.env.DATABASE_URL = normalized;
      return normalized;
    }
    return url;
  } catch {
    return url;
  }
};

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
let databaseName;
try {
  databaseName = new URL(databaseUrl).pathname.replace(/^\/+/, '');
} catch {
  console.error('DATABASE_URL em backend/.env.test não é uma URL válida.');
  process.exit(1);
}

if (!/test/i.test(databaseName)) {
  console.error('Por segurança, DATABASE_URL deve apontar para um banco cujo nome contenha "test".');
  process.exit(1);
}

process.env.NODE_ENV = 'test';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const options = process.argv.slice(2);
const jestArgs = options.includes('--coverage')
  ? ['--coverage', '--runInBand']
  : options.includes('--all')
    ? ['--runInBand']
    : ['--selectProjects', 'integration', '--runInBand'];

for (const args of [
  ['exec', 'prisma', '--', 'migrate', 'deploy'],
  ['exec', 'jest', '--', ...jestArgs],
]) {
  const child = spawnSync(npm, args, {
    cwd: backendDir,
    env: process.env,
    stdio: 'inherit',
  });
  if (child.error) {
    console.error(child.error.message);
    process.exit(1);
  }
  if (child.status !== 0) process.exit(child.status ?? 1);
}
