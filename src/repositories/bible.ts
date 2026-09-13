import type { Book, Chapter } from "@/types/bible";
import { BOOK_CATALOG } from "@/lib/bible/catalog";
import { FileSystemBibleRepository } from "@/repositories/bible-fs";
import { AssetsBibleRepository } from "@/repositories/bible-assets";

/**
 * Contrato del repositorio biblico.
 *
 * Hay varias implementaciones (fs, assets) elegidas segun el runtime.
 * Esta interfaz:
 *   1. documenta el contrato que la capa de servicio consume,
 *   2. permite swap a otra fuente (DB, CMS, R2) sin tocar servicios ni UI,
 *   3. hace triviales los tests de servicio con un mock in-memory.
 */
export interface IBibleRepository {
  /** Lista los libros disponibles, ordenados por `order` ascendente. */
  listBooks(): Promise<Book[]>;

  /** Devuelve un libro por id, o `null` si no existe. */
  findBook(bookId: string): Promise<Book | null>;

  /**
   * Devuelve un capitulo, o `null` si el libro no existe o el capitulo
   * no tiene archivo JSON.
   */
  findChapter(bookId: string, chapter: number): Promise<Chapter | null>;
}

export { BOOK_CATALOG, FileSystemBibleRepository, AssetsBibleRepository };
export type { Book, Chapter };

/**
 * Fetcher del binding ASSETS de Cloudflare Workers.
 * Provisto por @opennextjs/cloudflare types en runtime.
 */
type AssetsFetcher = {
  fetch(input: string | URL | Request): Promise<Response>;
};

/**
 * Runtime context opcional.
 *
 * En Cloudflare Workers (via OpenNext), cada Server Component recibe
 * el contexto Cloudflare per-request. En Vercel y dev local, este objeto
 * es undefined y se usa fs.
 */
export type BibleRuntime = {
  assets?: AssetsFetcher;
};

/**
 * Fabrica del repo segun runtime.
 *
 * - Si el contexto trae `assets` (Workers): AssetsBibleRepository.
 * - Si no (Vercel / dev local): FileSystemBibleRepository.
 *
 * Patron de uso en Server Components:
 *
 *   import { getBibleRepository } from "@/repositories/bible";
 *   import { getCloudflareContext } from "@opennextjs/cloudflare";
 *
 *   const ctx = await getCloudflareContext({ async: true });
 *   const repo = getBibleRepository({ assets: ctx.env?.ASSETS });
 *   const chapter = await repo.findChapter(bookId, chapter);
 */
export function getBibleRepository(
  runtime?: BibleRuntime,
): IBibleRepository {
  if (runtime?.assets) {
    return new AssetsBibleRepository(
      runtime.assets,
      Object.keys(BOOK_CATALOG),
    );
  }
  return new FileSystemBibleRepository();
}
