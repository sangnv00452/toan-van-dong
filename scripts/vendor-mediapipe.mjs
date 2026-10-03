// Copies the MediaPipe wasm runtime and downloads the hand-landmark model into
// public/mediapipe so the game never needs a CDN at runtime (works offline).
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'mediapipe');
const wasmOut = join(outDir, 'wasm');
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const WASM_FILES = [
  'vision_wasm_internal.js',
  'vision_wasm_internal.wasm',
  'vision_wasm_nosimd_internal.js',
  'vision_wasm_nosimd_internal.wasm',
];

const exists = (p) => stat(p).then(() => true, () => false);

// The package only exports its bundle, so locate the folder through it.
const require = createRequire(import.meta.url);
const pkgDir = dirname(require.resolve('@mediapipe/tasks-vision'));

await mkdir(wasmOut, { recursive: true });
for (const file of WASM_FILES) {
  await copyFile(join(pkgDir, 'wasm', file), join(wasmOut, file));
}
console.log(`[vendor] wasm runtime -> ${wasmOut}`);

const modelPath = join(outDir, 'hand_landmarker.task');
if (await exists(modelPath)) {
  console.log('[vendor] hand model already present');
} else {
  console.log('[vendor] downloading hand model…');
  const res = await fetch(MODEL_URL);
  if (!res.ok) throw new Error(`Model download failed: HTTP ${res.status}`);
  await writeFile(modelPath, Buffer.from(await res.arrayBuffer()));
  console.log(`[vendor] model saved -> ${modelPath}`);
}
