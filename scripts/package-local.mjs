// Packs the built site into release/MathFrog-local.zip: a folder that runs on any
// Windows 10/11 PC with no Node.js and no Internet (double-click CHAY-MATH-FROG.bat).
// Run through `npm run package:local`, which builds first.
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const built = join(root, 'dist');
const templates = join(root, 'scripts', 'local-package');
const releaseDir = join(root, 'release');
const outDir = join(releaseDir, 'MathFrog-local');
const zipPath = join(releaseDir, 'MathFrog-local.zip');

const exists = (p) => stat(p).then(() => true, () => false);

for (const required of ['index.html', 'mediapipe/hand_landmarker.task', 'mediapipe/wasm/vision_wasm_internal.wasm']) {
  if (!(await exists(join(built, required)))) {
    throw new Error(`Missing build output ${required}. Run "npm run package:local" (it builds first).`);
  }
}

await rm(outDir, { recursive: true, force: true });
await rm(zipPath, { force: true });
await mkdir(outDir, { recursive: true });

await cp(built, join(outDir, 'app'), { recursive: true });
await cp(join(templates, 'serve-local.ps1'), join(outDir, 'serve-local.ps1'));

// Windows tools expect CRLF; the BOM lets old Notepad show Vietnamese correctly.
const crlf = (s) => s.replace(/\r?\n/g, '\r\n');
const guide = await readFile(join(templates, 'HUONG-DAN.txt'), 'utf8');
await writeFile(join(outDir, 'HUONG-DAN.txt'), '﻿' + crlf(guide));
const launcher = [
  '@echo off',
  'REM Chay Math Frog tren may nay - khong can Internet, khong can cai Node.js.',
  'cd /d "%~dp0"',
  'powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-local.ps1"',
  '',
].join('\n');
await writeFile(join(outDir, 'CHAY-MATH-FROG.bat'), crlf(launcher));

if (process.platform === 'win32') {
  execFileSync(
    'powershell',
    ['-NoProfile', '-Command', `Compress-Archive -Path '${outDir}' -DestinationPath '${zipPath}' -Force`],
    { stdio: 'inherit' },
  );
} else {
  execFileSync('zip', ['-qr', zipPath, 'MathFrog-local'], { cwd: releaseDir, stdio: 'inherit' });
}

const mb = ((await stat(zipPath)).size / 1024 / 1024).toFixed(1);
console.log(`[package] ${zipPath} (${mb} MB)`);
console.log('[package] Unzip, then double-click CHAY-MATH-FROG.bat');
