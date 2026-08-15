/**
 * build-worker.mjs — bundles index.html, styles.css and script.js into
 * worker.js as ASSETS_JSON so the site can be deployed as a single-file
 * Cloudflare Worker (paste the resulting worker.js into the dashboard).
 *
 * Usage:  node build-worker.mjs
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

const json = JSON.stringify(files, null, 2);
const patched = workerSrc.replace(
  /const ASSETS_JSON = \{\};/,
  "const ASSETS_JSON = " + json + ";"
);

writeFileSync(path.join(dir, "worker.js"), patched);
console.log("worker.js bundled:", Object.keys(files).map((k) => `${k} (${files[k].length}B)`).join(", "));
