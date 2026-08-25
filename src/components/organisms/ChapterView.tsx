"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/components/atoms/Icon";
import { NoteCard } from "@/components/molecules/NoteCard";
import { PartHeader } from "@/components/molecules/PartHeader";
import { VerseCard } from "@/components/molecules/VerseCard";
import { cn } from "@/lib/cn";

import type { Chapter, Note } from "@/types/bible";

type ChapterViewProps = {
  chapter: Chapter;
};

/**
 * Vista del capítulo. Client porque coordina el estado del panel
 * de notas (abierto/cerrado, nota activa).
 *
 * Mantiene un único source of truth para "qué nota está activa".
 * El versículo y la nota se sincronizan via este id.
 */
export function ChapterView({ chapter }: ChapterViewProps) {
  const [open, setOpen] = useState(true);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);

  const notesByVerse = useMemo(() => {
    const map = new Map<number, Note[]>();
    for (const note of chapter.notes) {
      const list = map.get(note.verse) ?? [];
      list.push(note);
      map.set(note.verse, list);
    }
    return map;
  }, [chapter.notes]);

  const versesByPart = useMemo(() => {
    return chapter.parts.map((part) => ({
      part,
      verses: chapter.verses.filter(
        (v) => v.number >= part.verseRange[0] && v.number <= part.verseRange[1],
      ),
    }));
  }, [chapter.parts, chapter.verses]);

  const handleNoteClick = (id: number) => {
    setOpen(true);
    setActiveNoteId(id);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document
          .getElementById(`note-${id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <article className="bible-text min-w-0">
        {chapter.title ? (
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            {chapter.title}
          </h1>
        ) : null}
        <p className="mb-10 text-sm text-[var(--color-muted)]">
          Capítulo {chapter.number} · {chapter.verses.length} versículos ·{" "}
          {chapter.notes.length} nota
          {chapter.notes.length === 1 ? "" : "s"}
        </p>

        {versesByPart.map(({ part, verses }, idx) => (
          <section key={`${part.verseRange[0]}-${part.verseRange[1]}`}>
            <PartHeader
              index={idx + 1}
              range={part.verseRange}
            />
            <h3 className="mb-4 text-lg font-medium text-[var(--color-ink)]">
              {part.title}
            </h3>
            <div className="space-y-3">
              {verses.map((verse) => (
                <VerseCard
                  key={verse.number}
                  verse={verse}
                  notes={notesByVerse.get(verse.number)}
                  onNoteClick={handleNoteClick}
                />
              ))}
            </div>
          </section>
        ))}
      </article>

      <aside
        aria-label="Notas de crítica textual"
        className={cn(
          "lg:sticky lg:top-6 lg:self-start",
          open ? "" : "lg:w-12",
        )}
      >
        <div className="rounded-lg border border-[var(--color-rule)] bg-[var(--color-background)]">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 border-b border-[var(--color-rule)] px-4 py-3 text-left text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-rule)]/30"
            aria-expanded={open}
          >
            <span className="inline-flex items-center gap-2">
              <Icon name="panel-right" className="h-4 w-4" />
              {open ? "Notas" : `${chapter.notes.length}`}
            </span>
            <Icon
              name={open ? "x" : "chevron-right"}
              className="h-3.5 w-3.5 text-[var(--color-muted)]"
            />
          </button>
          {open ? (
            <div className="max-h-[calc(100vh-8rem)] space-y-3 overflow-y-auto p-4">
              {chapter.notes.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  Este capítulo no tiene notas.
                </p>
              ) : (
                chapter.notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    active={note.id === activeNoteId}
                  />
                ))
              )}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
