import Link from "next/link";

type ChapterTileProps = {
  bookId: string;
  number: number;
  available: boolean;
};

export function ChapterTile({ bookId, number, available }: ChapterTileProps) {
  const className = available
    ? "flex h-12 items-center justify-center rounded-md border border-[var(--color-rule)] text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)]/40 hover:bg-[var(--color-rule)]/30"
    : "flex h-12 items-center justify-center rounded-md border border-dashed border-[var(--color-rule)] text-sm text-[var(--color-muted)]/60 cursor-not-allowed";

  if (!available) {
    return (
      <span aria-disabled className={className}>
        {number}
      </span>
    );
  }

  return (
    <Link href={`/${bookId}/${number}`} className={className}>
      {number}
    </Link>
  );
}
