import { Fragment } from "react";

import type { Note, Verse } from "@/types/bible";

type VerseCardProps = {
  verse: Verse;
  /** Notas asociadas a este versículo, si las tiene. */
  notes?: Note[];
  /** Callback al hacer click en el número del versículo o un marcador [n]. */
  onNoteClick?: (noteId: number) => void;
};

/**
 * Renderiza un versículo. Las marcas [n] dentro del texto se vuelven
 * botones clicables que disparan `onNoteClick(n)`.
 */
export function VerseCard({ verse, notes, onNoteClick }: VerseCardProps) {
  const segments = verse.text.split(/(\[\d+\])/g);

  return (
    <p
      id={`v-${verse.number}`}
      className="scroll-mt-24 text-[1.075rem] leading-[1.85] text-[var(--color-ink)]"
    >
      <button
        type="button"
        onClick={() => {
          const first = notes?.[0];
          if (first && onNoteClick) onNoteClick(first.id);
        }}
        className="verse-number hover:underline focus:outline-none focus:underline"
        aria-label={`Versículo ${verse.number}${notes?.length ? `, con ${notes.length} nota(s)` : ""}`}
      >
        {verse.number}
      </button>
      {segments.map((segment, i) => {
        const match = segment.match(/^\[(\d+)\]$/);
        if (match) {
          const id = Number(match[1]);
          return (
            <button
              key={`${verse.number}-${i}`}
              type="button"
              onClick={() => onNoteClick?.(id)}
              className="mx-0.5 inline-flex h-5 min-w-5 cursor-pointer items-center justify-center rounded-full bg-[var(--color-accent)]/15 px-1.5 align-super text-[0.7rem] font-semibold text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
              aria-label={`Nota ${id}`}
            >
              {id}
            </button>
          );
        }
        return <Fragment key={`${verse.number}-${i}`}>{segment}</Fragment>;
      })}
    </p>
  );
}
