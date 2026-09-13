import type { Book } from "@/types/bible";

/**
 * Metadata canonica de cada libro.
 *
 * Compartido por todas las implementaciones del repositorio (fs, assets, R2,
 * etc.). Para agregar un libro nuevo:
 *   1. crear la carpeta content/books/<id> con sus capitulos JSON,
 *   2. agregar una entrada aca,
 *   3. correr pnpm build:content (sincroniza a public/content/books).
 */
export const BOOK_CATALOG: Record<
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
