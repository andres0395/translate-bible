import type { Book, Chapter } from "@/types/bible";

import { BOOK_CATALOG } from "@/lib/bible/catalog";
import { publicChapterUrl } from "@/lib/bible/paths";
import type { IBibleRepository } from "@/repositories/bible";

/**
 * Implementacion con el binding ASSETS de OpenNext.
 *
 * Funciona en Cloudflare Workers (donde no hay fs). El binding es un
 * Fetcher que sirve los archivos estaticos de public/.
 *
 * Cache en memoria a nivel de modulo (warm isolate): el contenido es
 * inmutable entre deploys, asi que cachear hasta el siguiente cold start
 * del isolate es seguro y barato. Esto evita los ~50 subrequests por
 * request a listBooks una vez que el isolate esta caliente.
 */

const chapterCache = new Map<string, Chapter | null>();
const bookCache = new Map<string, Book | null>();
let listCache: Book[] | null = null;

export function clearAssetsBibleCache(): void {
  chapterCache.clear();
  bookCache.clear();
  listCache = null;
}

export class AssetsBibleRepository implements IBibleRepository {
  constructor(
    private readonly assets: Fetcher,
    private readonly bookIds: readonly string[],
  ) {}

  async listBooks(): Promise<Book[]> {
    if (listCache) return listCache;

    const books = await Promise.all(this.bookIds.map((id) => this.findBook(id)));
    const result = books
      .filter((b): b is Book => b !== null)
      .sort((a, b) => a.order - b.order);

    listCache = result;
    return result;
  }

  async findBook(bookId: string): Promise<Book | null> {
    if (bookCache.has(bookId)) return bookCache.get(bookId) ?? null;

    const meta = BOOK_CATALOG[bookId];
    if (!meta) {
      bookCache.set(bookId, null);
      return null;
    }

    const available: number[] = [];
    // Recorremos 1..totalChapters y paramos en el primer hueco grande.
    // Cap en 3 fallos consecutivos para evitar loops absurdos.
    let misses = 0;
    for (let n = 1; n <= meta.totalChapters; n++) {
      const ch = await this.fetchChapter(bookId, n);
      if (ch) {
        available.push(n);
        misses = 0;
      } else {
        misses++;
        if (misses >= 3) break;
      }
    }

    if (available.length === 0) {
      bookCache.set(bookId, null);
      return null;
    }
    const book: Book = { id: bookId, ...meta, chapters: available };
    bookCache.set(bookId, book);
    return book;
  }

  async findChapter(
    bookId: string,
    chapter: number,
  ): Promise<Chapter | null> {
    if (!Number.isInteger(chapter) || chapter < 1) return null;
    return this.fetchChapter(bookId, chapter);
  }

  private async fetchChapter(
    bookId: string,
    chapter: number,
  ): Promise<Chapter | null> {
    const key = `${bookId}/${chapter}`;
    if (chapterCache.has(key)) return chapterCache.get(key) ?? null;

    const url = publicChapterUrl(bookId, chapter);
    const res = await this.assets.fetch(url);
    if (!res.ok) {
      chapterCache.set(key, null);
      return null;
    }

    try {
      const parsed = (await res.json()) as Chapter;
      if (
        typeof parsed.bookId !== "string" ||
        typeof parsed.number !== "number" ||
        !Array.isArray(parsed.verses)
      ) {
        chapterCache.set(key, null);
        return null;
      }
      chapterCache.set(key, parsed);
      return parsed;
    } catch {
      chapterCache.set(key, null);
      return null;
    }
  }
}
