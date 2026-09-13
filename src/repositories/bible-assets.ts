import type { Book, Chapter } from "@/types/bible";

import { BOOK_CATALOG } from "@/lib/bible/catalog";
import { publicChapterUrl } from "@/lib/bible/paths";
import type { IBibleRepository } from "@/repositories/bible";

/**
 * Fetcher viene como tipo global de los bindings de Cloudflare Workers
 * (provisto por @opennextjs/cloudflare types). Si tu editor no lo
 * reconoce, agregá "@cloudflare/workers-types" a devDependencies.
 */

/**
 * Implementacion con el binding ASSETS de OpenNext.
 *
 * Funciona en Cloudflare Workers (donde no hay fs). El binding es un
 * Fetcher que sirve los archivos estaticos de public/.
 *
 * Para descubrir capitulos de un libro intentamos leer 1.json hasta
 * totalChapters y paramos al primer 404. Es O(totalChapters) por libro,
 * aceptable porque el listado se cachea a nivel de Next.js.
 */
export class AssetsBibleRepository implements IBibleRepository {
  constructor(
    private readonly assets: Fetcher,
    private readonly bookIds: readonly string[],
  ) {}

  async listBooks(): Promise<Book[]> {
    const books = await Promise.all(
      this.bookIds.map((id) => this.findBook(id)),
    );
    return books
      .filter((b): b is Book => b !== null)
      .sort((a, b) => a.order - b.order);
  }

  async findBook(bookId: string): Promise<Book | null> {
    const meta = BOOK_CATALOG[bookId];
    if (!meta) return null;

    const available: number[] = [];
    for (let n = 1; n <= meta.totalChapters; n++) {
      const ch = await this.fetchChapter(bookId, n);
      if (ch) available.push(n);
    }

    if (available.length === 0) return null;
    return { id: bookId, ...meta, chapters: available };
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
    const url = publicChapterUrl(bookId, chapter);
    const res = await this.assets.fetch(url);
    if (!res.ok) return null;

    try {
      const parsed = (await res.json()) as Chapter;
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
