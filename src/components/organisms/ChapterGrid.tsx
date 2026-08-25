import { ChapterTile } from "@/components/molecules/ChapterTile";

type ChapterGridProps = {
  bookId: string;
  totalChapters: number;
  /** Capítulos que tienen archivo JSON. Si se omite, se asumen todos. */
  availableChapters?: number[];
};

export function ChapterGrid({
  bookId,
  totalChapters,
  availableChapters,
}: ChapterGridProps) {
  const available = new Set(availableChapters ?? []);
  const cells = Array.from({ length: totalChapters }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
      {cells.map((n) => (
        <ChapterTile
          key={n}
          bookId={bookId}
          number={n}
          available={available.size === 0 || available.has(n)}
        />
      ))}
    </div>
  );
}
