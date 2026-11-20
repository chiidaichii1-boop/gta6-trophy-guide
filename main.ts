// Leonida Trophy Guide — gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide itself is app/: plain static files (index.html, app.js, style.css and
// data/trophies.json) that any static server can serve with the network off.
// This program hands the guide in: it copies app/ and screenshots/ from beside
// this file into /output (or MAKEFUN_OUTPUT_DIR outside the grader) and writes
// /output/dossier.json with the kit's vendored library, so the judge reads the
// same dossier the scorer rebuilds. vendor/makefun-frontend.ts is the kit's
// copy, unchanged: the scorer requires the dossier byte for byte.
//
// It only ever creates directories and writes files inside /output — it never
// deletes the output folder itself (the grader runs as an unprivileged user
// and could not remove it). The run is deterministic: the same repo always
// writes the same bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function countEntries(dir) {
  let files = 0;
  let dirs = 0;
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      dirs += 1;
      const sub = countEntries(path);
      files += sub.files;
      dirs += sub.dirs;
    } else {
      files += 1;
    }
  }
  return { files, dirs };
}

// Fail loudly, before writing the dossier, if the handover would break the
// scorer's own caps: 3 or 4 screenshots, each at most 256 KiB, and at most
// 993 files and directories in app/. A quiet bad output would cost the entry.
const shotDir = join(here, 'screenshots');
const shotNames = existsSync(shotDir) ? readdirSync(shotDir).sort() : [];
if (shotNames.length < 3 || shotNames.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shotNames.length}`);
}
for (const name of shotNames) {
  const size = statSync(join(shotDir, name)).size;
  if (size > 262144) throw new Error(`screenshot ${name} is ${size} bytes, over the 256 KiB cap`);
}
const appCount = countEntries(join(here, 'app'));
if (appCount.files + appCount.dirs > 993) {
  throw new Error(`app/ has ${appCount.files + appCount.dirs} files and directories, over the 993 cap`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shotDir)) {
  cpSync(shotDir, join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in app/
// or 48 MiB of app files — app/ counts beside /output's own 1000-entry cap,
// its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

const shotCount = readdirSync(join(out, 'screenshots')).length;
const dossierPath = join(out, 'dossier.json');
const dossierBytes = statSync(dossierPath).size;
console.log(`Leonida Trophy Guide: ${appCount.files} app files in ${appCount.dirs} directories, ${shotCount} screenshots, dossier ${dossierBytes} bytes at ${dossierPath}`);
