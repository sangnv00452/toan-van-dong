// Builds public/fonts/math-frog-emoji.woff: a tiny colour-emoji font holding only the
// emoji the game uses, cut from Google's Noto Color Emoji (SIL Open Font License).
// Older Windows (e.g. Windows 10) has no glyph for newer emoji such as 🪷 🫧 🥷 🪜 and
// draws an empty box instead; shipping our own font makes every PC look the same, offline.
//
// Re-run after adding a new emoji: `npm run emoji-font` (needs Python with fonttools).
// tests/emoji-font.test.ts fails when the code uses an emoji the font does not cover.
import { execFileSync } from 'node:child_process';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_URL = 'https://github.com/googlefonts/noto-emoji/raw/main/2D/fonts/Noto-COLRv1.ttf';
const sourcePath = join(root, '.cache', 'Noto-COLRv1.ttf');
const outPath = join(root, 'public', 'fonts', 'math-frog-emoji.woff');
const coveragePath = join(root, 'scripts', 'emoji-font-coverage.json');
/** Variation selector-16 and zero-width joiner keep emoji sequences intact. */
const JOINERS = [0xfe0f, 0x200d];

const exists = (p) => stat(p).then(() => true, () => false);

async function listFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(p)));
    else out.push(p);
  }
  return out;
}

// Same scan as tests/emoji-font.test.ts: every pictographic character in the sources.
const files = [...(await listFiles(join(root, 'src'))), join(root, 'index.html'), join(root, 'presentation', 'giai-thich-he-thong.html')];
const codepoints = new Set(JOINERS);
for (const file of files) {
  for (const ch of await readFile(file, 'utf8')) {
    const cp = ch.codePointAt(0);
    if (cp > 0xff && /\p{Extended_Pictographic}/u.test(ch)) codepoints.add(cp);
  }
}

if (!(await exists(sourcePath))) {
  console.log('[emoji-font] downloading Noto Color Emoji…');
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  await mkdir(dirname(sourcePath), { recursive: true });
  await writeFile(sourcePath, Buffer.from(await res.arrayBuffer()));
}

await mkdir(dirname(outPath), { recursive: true });
const unicodes = [...codepoints].map((cp) => cp.toString(16)).join(',');
execFileSync(
  'python',
  ['-m', 'fontTools.subset', sourcePath, `--unicodes=${unicodes}`, '--layout-features=*', '--flavor=woff', `--output-file=${outPath}`],
  { stdio: 'inherit' },
);

// Record what the finished font really covers, read back from its character map.
const covered = JSON.parse(
  execFileSync('python', ['-c', 'import sys,json;from fontTools.ttLib import TTFont;print(json.dumps(sorted(TTFont(sys.argv[1]).getBestCmap())))', outPath], {
    encoding: 'utf8',
  }),
);
await writeFile(coveragePath, JSON.stringify(covered) + '\n');

const missing = [...codepoints].filter((cp) => !JOINERS.includes(cp) && !covered.includes(cp));
const kb = ((await stat(outPath)).size / 1024).toFixed(0);
console.log(`[emoji-font] ${covered.length} characters, ${kb} KB -> ${outPath}`);
if (missing.length) console.warn(`[emoji-font] not in Noto Color Emoji: ${missing.map((cp) => String.fromCodePoint(cp)).join(' ')}`);
