import path from "node:path";

/**
 * Resolucion del raiz de contenido desde process.cwd().
 *
 * Se usa en runtime con fs (Vercel / dev local). En Workers no se importa
 * este archivo: ahi se usa el binding ASSETS via AssetsBibleRepository.
 */
export const CONTENT_ROOT = path.join(process.cwd(), "content", "books");

/** Path al directorio de un libro (fs). */
export function bookDir(bookId: string): string {
  return path.join(CONTENT_ROOT, bookId);
}

/** Path al archivo de un capitulo (fs). */
export function chapterFile(bookId: string, chapter: number): string {
  return path.join(bookDir(bookId), `${chapter}.json`);
}

/**
 * Path virtual dentro de public/ (Assets binding de OpenNext).
 * Estructura paralela a CONTENT_ROOT para que fs y assets resuelvan igual.
 */
export function publicChapterPath(bookId: string, chapter: number): string {
  return `/content/books/${bookId}/${chapter}.json`;
}

/**
 * URL absoluta para hacer fetch via el binding ASSETS.
 * El binding es un Fetcher, asi que necesita una URL completa.
 */
export function publicChapterUrl(bookId: string, chapter: number): string {
  return `https://assets.local${publicChapterPath(bookId, chapter)}`;
}
