/**
 * Dominio: Biblia
 *
 * Un solo capítulo por archivo JSON en /content/books/<book-id>/<chapter>.json.
 * Cada libro se descubre por su carpeta; cada capítulo dentro del libro se
 * descubre por los archivos numerados que contiene.
 *
 * Esto permite agregar un libro nuevo creando una carpeta y un capítulo
 * creando un solo archivo, sin tocar código.
 */

export type Testament = "old" | "new";

/** Metadata de un libro (sin contenido de capítulos). */
export type Book = {
  /** slug en kebab-case, ej. "genesis", "exodo" */
  id: string;
  /** título en español, ej. "Génesis" */
  title: string;
  /** abreviatura usual, ej. "Gn" */
  abbreviation: string;
  /** orden canónico, 1-based */
  order: number;
  /** "old" (AT) | "new" (NT) */
  testament: Testament;
  /** total canónico de capítulos del libro. */
  totalChapters: number;
  /** números de capítulos disponibles en /content, ordenados ascendente. */
  chapters: number[];
};

/** Rango inclusivo [inicio, fin]. */
export type VerseRange = readonly [number, number];

/** Sección narrativa dentro de un capítulo, ej. "Parte 1: El juramento de Abraham". */
export type ChapterPart = {
  title: string;
  /** Versículos que cubre esta parte, inclusivo. */
  verseRange: VerseRange;
};

/** Un versículo. */
export type Verse = {
  number: number;
  text: string;
};

/** Nota de crítica textual y lingüística asociada a un versículo. */
export type Note = {
  /** id único dentro del capítulo, 1-based. Coincide con la marca en el texto. */
  id: number;
  /** número del versículo al que está asociada la nota */
  verse: number;
  /** título corto, ej. "Nombre Divino" */
  title: string;
  /** transcripción del término original (hebreo/griego), opcional */
  transcription?: string;
  /** cuerpo de la nota */
  content: string;
};

/** Capítulo completo. */
export type Chapter = {
  bookId: string;
  number: number;
  title?: string;
  parts: ChapterPart[];
  verses: Verse[];
  notes: Note[];
};
