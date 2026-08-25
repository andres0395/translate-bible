import { BibleLayout } from "@/components/templates/BibleLayout";
import { BookList } from "@/components/organisms/BookList";
import { bibleService } from "@/services/bible";

export default async function HomePage() {
  const books = await bibleService.listBooks();
  const { old, new: newTestament } = bibleService.groupByTestament(books);

  return (
    <BibleLayout>
      <section className="mb-12">
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-5xl">
          Biblia
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
          Traducción basada en la intención del autor y el contexto histórico y
          lingüístico de cada texto, sin doctrina religiosa.
        </p>
      </section>

      <BookList title="Antiguo Testamento" books={old} />
      <BookList title="Nuevo Testamento" books={newTestament} />
    </BibleLayout>
  );
}
