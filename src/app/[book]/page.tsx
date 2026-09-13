import { notFound } from "next/navigation";

import { BibleLayout } from "@/components/templates/BibleLayout";
import { ChapterGrid } from "@/components/organisms/ChapterGrid";
import { getBibleRepository } from "@/repositories/bible";
import { BibleService } from "@/services/bible";

type Props = {
  params: Promise<{ book: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { book: bookId } = await params;
  const service = new BibleService(getBibleRepository());
  const book = await service.getBook(bookId);
  if (!book) return { title: "Libro no encontrado" };
  return { title: `${book.title} · Biblia` };
}

export default async function BookPage({ params }: Props) {
  const { book: bookId } = await params;
  const service = new BibleService(getBibleRepository());
  const book = await service.getBook(bookId);
  if (!book) notFound();

  return (
    <BibleLayout crumbs={[{ label: book.title }]}>
      <header className="mb-10">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {book.abbreviation} ·{" "}
          {book.testament === "old" ? "Antiguo Testamento" : "Nuevo Testamento"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          {book.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {book.chapters.length} de {book.totalChapters} capítulos disponibles
        </p>
      </header>

      <ChapterGrid
        bookId={book.id}
        totalChapters={book.totalChapters}
        availableChapters={book.chapters}
      />
    </BibleLayout>
  );
}
