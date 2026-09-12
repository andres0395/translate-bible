#!/usr/bin/env node
// @ts-check
/**
 * Genera `src/generated/bible-content.ts` con todos los capítulos bundleados
 * como módulos TS, para que el Worker los incluya en el bundle y no necesite
 * leer del filesystem en runtime.
 *
 * Se ejecuta como paso de prebuild (ver scripts en package.json).
 *
 * Estructura generada:
 *   const CHAPTERS: Record<string, Record<number, Chapter>> = {
 *     genesis: { 24: {...}, 25: {...}, ... },
 *     exodo:   { 1:  {...}, 2:  {...}, ... },
 *   };
 *   export const BOOK_IDS: readonly string[];
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const CONTENT_ROOT = path.join(PROJECT_ROOT, "content", "books");
const OUT_DIR = path.join(PROJECT_ROOT, "src", "generated");
const OUT_FILE = path.join(OUT_DIR, "bible-content.ts");

/** @typedef {{bookId: string, number: number, [k: string]: unknown}} Chapter */

/**
 * Carga todos los capítulos de un libro, ordenados.
 * @param {string} bookId
 * @returns {Promise<Record<number, Chapter>>}
 */
async function loadBook(bookId) {
  const dir = path.join(CONTENT_ROOT, bookId);
  const entries = await readdir(dir);
  const chapterNumbers = entries
    .filter((n) => /^\d+\.json$/.test(n))
    .map((n) => Number.parseInt(n.replace(".json", ""), 10))
    .filter((n) => Number.isInteger(n) && n > 0)
    .sort((a, b) => a - b);

  /** @type {Record<number, Chapter>} */
  const result = {};
  for (const n of chapterNumbers) {
    const raw = await readFile(path.join(dir, `${n}.json`), "utf-8");
    result[n] = JSON.parse(raw);
  }
  return result;
}

async function main() {
  const bookDirs = (await readdir(CONTENT_ROOT, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  /** @type {Record<string, Record<number, Chapter>>} */
  const data = {};
  for (const id of bookDirs) {
    data[id] = await loadBook(id);
  }

  const lines = [
    `/**`,
    ` * AUTO-GENERADO por scripts/build-content-bundle.mjs — no editar a mano.`,
    ` * Regenerar con: pnpm build:content`,
    ` */`,
    ``,
    `import type { Chapter } from "@/types/bible";`,
    ``,
    `export const CHAPTERS: Readonly<Record<string, Readonly<Record<number, Chapter>>>> = ${JSON.stringify(
      data,
      null,
      2,
    )};`,
    ``,
    `export const BOOK_IDS: readonly string[] = Object.keys(CHAPTERS);`,
    ``,
  ];

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, lines.join("\n"), "utf-8");

  let totalChapters = 0;
  for (const id of bookDirs) totalChapters += Object.keys(data[id]).length;
  console.log(
    `[bundle] ${bookDirs.length} libros, ${totalChapters} capítulos → ${path.relative(
      PROJECT_ROOT,
      OUT_FILE,
    )}`,
  );
}

main().catch((err) => {
  console.error("[bundle] ERROR:", err);
  process.exit(1);
});
