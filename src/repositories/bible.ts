import type { Book, Chapter } from "@/types/bible";
import { BOOK_IDS, CHAPTERS } from "@/generated/bible-content";

/**
 * Contrato del repositorio bíblico.
 *
 * Esta interfaz existe aunque hoy tenga una sola implementación (in-memory)
 * porque:
 *   1. documenta el contrato que la capa de servicio consume,
 *   2. permite swap a otra fuente (DB, CMS, API) sin tocar servicios ni UI,
 *   3. hace triviales los tests de servicio con un mock in-memory.
 */
export interface IBibleRepository {
  /** Lista los libros disponibles, ordenados por `order` ascendente. */
  listBooks(): Promise<Book[]>;

  /** Devuelve un libro por id, o `null` si no existe. */
  findBook(bookId: string): Promise<Book | null>;

  /**
   * Devuelve un capítulo, o `null` si el libro no existe o el capítulo
   * no tiene archivo JSON.
   */
  findChapter(bookId: string, chapter: number): Promise<Chapter | null>;
}

/**
 * Mapea el nombre de carpeta a metadata del libro.
 * Para agregar un libro nuevo: crear la carpeta `content/books/<id>/`,
 * regenerar el bundle con `pnpm build:content`, y agregar una entrada acá.
 *
 * Decisión consciente: un solo punto de configuración por libro.
 * Si después querés que se autodetecte todo desde la carpeta, lo cambiamos.
 */
const BOOK_CATALOG: Record<
  string,
  Pick<Book, "title" | "abbreviation" | "order" | "testament" | "totalChapters">
> = {
  genesis: {
    title: "Génesis",
    abbreviation: "Gn",
    order: 1,
    testament: "old",
    totalChapters: 50,
  },
  exodo: {
    title: "Éxodo",
    abbreviation: "Ex",
    order: 2,
    testament: "old",
    totalChapters: 40,
  },
  levitico: {
    title: "Levítico",
    abbreviation: "Lv",
    order: 3,
    testament: "old",
    totalChapters: 27,
  },
  numeros: {
    title: "Números",
    abbreviation: "Nm",
    order: 4,
    testament: "old",
    totalChapters: 36,
  },
  deuteronomio: {
    title: "Deuteronomio",
    abbreviation: "Dt",
    order: 5,
    testament: "old",
    totalChapters: 34,
  },
};

/**
 * Implementación in-memory que lee del bundle generado por
 * `scripts/build-content-bundle.mjs`.
 *
 * Funciona en cualquier runtime (Node, Workers, edge) porque no toca
 * el filesystem: todo está en módulos TS que el bundler inlinea.
 */
class InMemoryBibleRepository implements IBibleRepository {
  async listBooks(): Promise<Book[]> {
    const books: Book[] = [];
    for (const id of BOOK_IDS) {
      const book = this.buildBook(id);
      if (book) books.push(book);
    }
    return books.sort((a, b) => a.order - b.order);
  }

  async findBook(bookId: string): Promise<Book | null> {
    return this.buildBook(bookId);
  }

  async findChapter(bookId: string, chapter: number): Promise<Chapter | null> {
    if (!Number.isInteger(chapter) || chapter < 1) return null;
    const book = CHAPTERS[bookId];
    if (!book) return null;
    const ch = book[chapter];
    if (!ch) return null;
    // Validación mínima de forma (defensa en profundidad).
    if (
      typeof ch.bookId !== "string" ||
      typeof ch.number !== "number" ||
      !Array.isArray(ch.verses)
    ) {
      return null;
    }
    return ch;
  }

  private buildBook(bookId: string): Book | null {
    const meta = BOOK_CATALOG[bookId];
    if (!meta) return null;
    const chapters = CHAPTERS[bookId];
    if (!chapters) return null;
    return {
      id: bookId,
      ...meta,
      chapters: Object.keys(chapters)
        .map((k) => Number.parseInt(k, 10))
        .filter((n) => Number.isInteger(n) && n > 0)
        .sort((a, b) => a - b),
    };
  }
}

export const bibleRepository: IBibleRepository = new InMemoryBibleRepository();
