/**
 * build-worker.mjs — bundles index.html, styles.css and script.js into
 * worker.js as ASSETS_JSON so the site can be deployed as a single-file
 * Cloudflare Worker (paste the resulting worker.js into the dashboard).
 *
 * Usage:  node build-worker.mjs
 *
 * This script replaces EVERYTHING from the `const ASSETS_JSON = ` marker
 * to the end of file, so re-running it always produces a fresh bundle
 * (idempotent) — even if worker.js already contains a previous bundle.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = {
  "index.html": readFileSync(path.join(dir, "index.html"), "utf8"),
  "styles.css": readFileSync(path.join(dir, "styles.css"), "utf8"),
  "script.js": readFileSync(path.join(dir, "script.js"), "utf8"),
};

const workerSrc = readFileSync(path.join(dir, "worker.js"), "utf8");

const marker = "const ASSETS_JSON = ";
const markerIdx = workerSrc.indexOf(marker);
if (markerIdx === -1) {
  console.error("build-worker.mjs: marker 'const ASSETS_JSON = ' not found in worker.js — aborting.");
  process.exit(1);
}

// Keep everything before the marker (worker logic + comments), drop any
// previous bundle, and append the freshly inlined assets.
const head = workerSrc.slice(0, markerIdx);
const json = JSON.stringify(files, null, 2);
const patched = head + marker + json + ";\n";

writeFileSync(path.join(dir, "worker.js"), patched);
console.log("worker.js bundled:", Object.keys(files).map((k) => `${k} (${files[k].length}B)`).join(", "));
