import { BookTile } from "@/components/molecules/BookTile";

import type { Book } from "@/types/bible";

type BookListProps = {
  title: string;
  books: Book[];
};

export function BookList({ title, books }: BookListProps) {
  if (books.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {books.map((book) => (
          <BookTile key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
