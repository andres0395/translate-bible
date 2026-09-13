#!/usr/bin/env node
// @ts-check
/**
 * Sincroniza content/books hacia public/content/books.
 *
 * Razon: el contenido no va bundleado en el Worker (crece al infinito y
 * revienta el limite de 10 MB de Cloudflare free). En su lugar, se copia
 * a public/, y en runtime Workers se sirve via el binding ASSETS de
 * OpenNext (env.ASSETS.fetch). En Vercel / dev local, el repo usa fs
 * directamente desde content/books, asi que la copia a public/ no hace dano.
 *
 * Se ejecuta como paso de predev / prebuild (ver scripts en package.json).
 *
 * Estructura generada:
 *   public/content/books/<book-id>/<chapter>.json
 */

import { readdir, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const CONTENT_ROOT = path.join(PROJECT_ROOT, "content", "books");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public", "content", "books");

/**
 * @param {string} src
 * @param {string} dst
 */
async function copyDir(src, dst) {
  await mkdir(dst, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      await copyDir(s, d);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      await copyFile(s, d);
    }
  }
}

async function main() {
  await copyDir(CONTENT_ROOT, PUBLIC_ROOT);

  const bookDirs = (await readdir(CONTENT_ROOT, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  let total = 0;
  for (const id of bookDirs) {
    const files = await readdir(path.join(CONTENT_ROOT, id));
    total += files.filter((f) => /^\d+\.json$/.test(f)).length;
  }

  console.log(
    `[sync] ${bookDirs.length} libros, ${total} capítulos → ${path.relative(
      PROJECT_ROOT,
      PUBLIC_ROOT,
    )}`,
  );
}

main().catch((err) => {
  console.error("[sync] ERROR:", err);
  process.exit(1);
});
