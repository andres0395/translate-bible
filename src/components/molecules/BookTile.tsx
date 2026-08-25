import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Icon } from "@/components/atoms/Icon";

import type { Book } from "@/types/bible";

type BookTileProps = {
  book: Book;
};

export function BookTile({ book }: BookTileProps) {
  return (
    <Link
      href={`/${book.id}`}
      className="group flex flex-col gap-1 rounded-lg border border-[var(--color-rule)] p-4 transition-colors hover:border-[var(--color-ink)]/30 hover:bg-[var(--color-rule)]/30"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-base font-semibold text-[var(--color-ink)] group-hover:underline">
          {book.title}
        </span>
        <Icon
          name="chevron-right"
          className="h-3.5 w-3.5 text-[var(--color-muted)] transition-transform group-hover:translate-x-0.5"
        />
      </div>
      <div className="flex items-center gap-2">
        <Badge>{book.abbreviation}</Badge>
        <span className="text-xs text-[var(--color-muted)]">
          {book.chapters.length}{" "}
          {book.chapters.length === 1 ? "capítulo" : "capítulos"}
        </span>
      </div>
    </Link>
  );
}
