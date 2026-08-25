import path from "node:path";

/**
 * Raíz del contenido bíblico, resuelto desde la raíz del proyecto.
 * El layout monorepo de Next.js garantiza que `process.cwd()` apunta aquí.
 */
export const CONTENT_ROOT = path.join(process.cwd(), "content", "books");

/** Path al directorio de un libro. */
export function bookDir(bookId: string): string {
  return path.join(CONTENT_ROOT, bookId);
}

/** Path al archivo de un capítulo. */
export function chapterFile(bookId: string, chapter: number): string {
  return path.join(bookDir(bookId), `${chapter}.json`);
}
