import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { Book, Chapter } from "@/types/bible";

import { CONTENT_ROOT, chapterFile } from "@/lib/bible/paths";

/**
 * Contrato del repositorio bíblico.
 *
 * Esta interfaz existe aunque hoy tenga una sola implementación (filesystem)
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
 * Para agregar un libro nuevo: crear la carpeta `content/books/<id>/`
 * y agregar una entrada acá (o moverlo a un `books.json` cuando duela).
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

class FileSystemBibleRepository implements IBibleRepository {
  async listBooks(): Promise<Book[]> {
    const entries = await readdir(CONTENT_ROOT, { withFileTypes: true });
    const folders = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();

    const books = await Promise.all(
      folders.map(async (id) => this.findBook(id)),
    );

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

    return {
      id: bookId,
      ...meta,
      chapters: chapterNumbers,
    };
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
      // Validación mínima de forma.
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

export const bibleRepository: IBibleRepository = new FileSystemBibleRepository();
