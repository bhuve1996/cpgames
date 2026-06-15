import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Returns true if nothing is accepting connections on the port. */
function isPortFree(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' });
    const done = (free) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(free);
    };
    socket.setTimeout(500);
    socket.once('connect', () => done(false));
    socket.once('timeout', () => done(true));
    socket.once('error', (err) => done(err.code === 'ECONNREFUSED'));
  });
}

async function findPort(start, exclude = new Set(), maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = start + i;
    if (exclude.has(port)) continue;
    if (await isPortFree(port)) return port;
  }
  throw new Error(`No free port found starting from ${start}`);
}

function run(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function spawnDev(name, command, args, options) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
  child.on('spawn', () => {
    console.log(`[dev] started ${name}`);
  });
  return child;
}

async function main() {
  const apiPort = await findPort(Number(process.env.API_PORT) || 3001);
  const webPort = await findPort(Number(process.env.WEB_PORT) || 3000, new Set([apiPort]));

  const apiUrl = `http://localhost:${apiPort}`;
  const webUrl = `http://localhost:${webPort}`;

  console.log(`\nPlayground dev — leave this running; changes auto-reload.\n`);
  console.log(`  Web: ${webUrl}`);
  console.log(`  API: ${apiUrl}`);
  if (apiPort !== 3001) console.log(`  (API port 3001 was busy, using ${apiPort})`);
  if (webPort !== 3000) console.log(`  (Web port 3000 was busy, using ${webPort})`);
  console.log('');

  const env = {
    ...process.env,
    API_PORT: String(apiPort),
    API_URL: apiUrl,
    CORS_ORIGIN: webUrl,
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_WS_URL: apiUrl,
  };

  // One-time compile so packages exist before watchers + servers start.
  await Promise.all([
    run('npm', ['run', 'build', '-w', '@playground/shared'], { cwd: root, env }),
    run('npm', ['run', 'build', '-w', '@playground/game-engine'], { cwd: root, env }),
  ]);

  const children = [
    spawnDev('shared', 'npm', ['run', 'dev', '-w', '@playground/shared'], { cwd: root, env }),
    spawnDev('engine', 'npm', ['run', 'dev', '-w', '@playground/game-engine'], { cwd: root, env }),
    spawnDev('api', 'npm', ['run', 'dev', '-w', '@playground/api'], { cwd: root, env }),
    spawnDev('web', 'npx', ['next', 'dev', '-p', String(webPort)], {
      cwd: path.join(root, 'apps/web'),
      env,
    }),
  ];

  const shutdown = () => {
    for (const child of children) child.kill('SIGTERM');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  for (const child of children) {
    child.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`[dev] a process exited with code ${code}`);
        shutdown();
        process.exit(code);
      }
    });
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
