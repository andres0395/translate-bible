import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { Book, Chapter } from "@/types/bible";

import { BOOK_CATALOG } from "@/lib/bible/catalog";
import { CONTENT_ROOT, chapterFile } from "@/lib/bible/paths";
import type { IBibleRepository } from "@/repositories/bible";

/**
 * Implementacion con filesystem.
 *
 * Funciona en:
 *   - Vercel (serverless functions con fs de solo lectura),
 *   - dev local (`next dev`).
 *
 * NO funciona en Cloudflare Workers: no hay fs. Ahi se usa AssetsBibleRepository.
 */
export class FileSystemBibleRepository implements IBibleRepository {
  async listBooks(): Promise<Book[]> {
    const entries = await readdir(CONTENT_ROOT, { withFileTypes: true });
    const folders = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();

    const books = await Promise.all(folders.map((id) => this.findBook(id)));
    return books
      .filter((b): b is Book => b !== null)
      .sort((a, b) => a.order - b.order);
  }

  async findBook(bookId: string): Promise<Book | null> {
    const meta = BOOK_CATALOG[bookId];
    if (!meta) return null;

    const dir = path.join(CONTENT_ROOT, bookId);
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      return null;
    }

    const chapterNumbers = entries
      .filter((name) => /^\d+\.json$/.test(name))
      .map((name) => Number.parseInt(name.replace(".json", ""), 10))
      .filter((n) => Number.isInteger(n) && n > 0)
      .sort((a, b) => a - b);

    return { id: bookId, ...meta, chapters: chapterNumbers };
  }

  async findChapter(bookId: string, chapter: number): Promise<Chapter | null> {
    if (!Number.isInteger(chapter) || chapter < 1) return null;

    const file = chapterFile(bookId, chapter);
    let raw: string;
    try {
      raw = await readFile(file, "utf-8");
    } catch {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Chapter;
      if (
        typeof parsed.bookId !== "string" ||
        typeof parsed.number !== "number" ||
        !Array.isArray(parsed.verses)
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
