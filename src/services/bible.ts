import { bibleRepository, type IBibleRepository } from "@/repositories/bible";

import type { Book, Chapter } from "@/types/bible";

/** Helper: último capítulo disponible de un libro (asume chapters no vacío). */
function lastChapter(book: Book): number {
  return book.chapters[book.chapters.length - 1] ?? 0;
}

/** Símbolo para inyección de dependencias en tests. */
export const BIBLE_REPOSITORY_TOKEN = Symbol.for("BibleRepository");

/** Vista agrupada de libros por testamento, ordenada canónicamente. */
export type BooksByTestament = {
  old: Book[];
  new: Book[];
};

/** Vecino de un capítulo para navegación prev/next. */
export type ChapterNavigation = {
  prev: { bookId: string; chapter: number } | null;
  next: { bookId: string; chapter: number } | null;
};

/**
 * Servicio bíblico. Único lugar donde vive la lógica de navegación,
 * agrupación y "este libro existe o no".
 *
 * Regla: si mañana agregás caché, búsqueda o tracking de lectura, entra acá,
 * no en el repositorio ni en la UI.
 */
class BibleService {
  constructor(private readonly repo: IBibleRepository) {}

  listBooks(): Promise<Book[]> {
    return this.repo.listBooks();
  }

  groupByTestament(books: Book[]): BooksByTestament {
    const old: Book[] = [];
    const newTestament: Book[] = [];
    for (const book of books) {
      if (book.testament === "old") old.push(book);
      else newTestament.push(book);
    }
    return { old, new: newTestament };
  }

  getBook(bookId: string): Promise<Book | null> {
    return this.repo.findBook(bookId);
  }

  getChapter(bookId: string, chapter: number): Promise<Chapter | null> {
    return this.repo.findChapter(bookId, chapter);
  }

  /**
   * Devuelve los capítulos adyacentes a (bookId, chapter) recorriendo
   * solo los capítulos disponibles. Esto evita enlazar a un capítulo
   * que aún no fue traducido (que devolvería 404).
   */
  async getChapterNavigation(
    bookId: string,
    chapter: number,
  ): Promise<ChapterNavigation> {
    const book = await this.repo.findBook(bookId);
    if (!book) return { prev: null, next: null };

    const idx = book.chapters.indexOf(chapter);
    if (idx === -1) return { prev: null, next: null };

    const prevInBook = idx > 0 ? book.chapters[idx - 1] : null;
    const nextInBook =
      idx < book.chapters.length - 1 ? book.chapters[idx + 1] : null;

    return {
      prev:
        prevInBook !== null
          ? { bookId, chapter: prevInBook }
          : await this.lastChapterOfPrevBook(bookId),
      next:
        nextInBook !== null
          ? { bookId, chapter: nextInBook }
          : await this.firstChapterOfNextBook(bookId),
    };
  }

  private async lastChapterOfPrevBook(
    bookId: string,
  ): Promise<{ bookId: string; chapter: number } | null> {
    const books = await this.repo.listBooks();
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx <= 0) return null;
    const prev = books[idx - 1];
    if (!prev || prev.chapters.length === 0) return null;
    return { bookId: prev.id, chapter: lastChapter(prev) };
  }

  private async firstChapterOfNextBook(
    bookId: string,
  ): Promise<{ bookId: string; chapter: number } | null> {
    const books = await this.repo.listBooks();
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx === -1 || idx === books.length - 1) return null;
    const next = books[idx + 1];
    if (!next || next.chapters.length === 0) return null;
    return { bookId: next.id, chapter: next.chapters[0] };
  }
}

export const bibleService = new BibleService(bibleRepository);
