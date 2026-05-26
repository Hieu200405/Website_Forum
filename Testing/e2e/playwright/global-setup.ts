import { execSync } from 'node:child_process';
import path from 'node:path';

async function globalSetup() {
  const repoRoot = path.resolve(__dirname, '../../..');
  execSync('docker exec forum_backend node src/seed.js', {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

export default globalSetup;
