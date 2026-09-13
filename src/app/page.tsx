import { BibleLayout } from "@/components/templates/BibleLayout";
import { BookList } from "@/components/organisms/BookList";
import { getBibleRepository } from "@/repositories/bible";
import { getRuntimeContext } from "@/lib/runtime";
import { BibleService } from "@/services/bible";

// `getRuntimeContext()` solo funciona per-request (no en build time).
// Forzamos render dinamico para que el contenido se evalue en runtime.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const runtime = await getRuntimeContext();
  const repo = getBibleRepository(runtime);
  const service = new BibleService(repo);

  const books = await service.listBooks();
  const { old, new: newTestament } = service.groupByTestament(books);

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
