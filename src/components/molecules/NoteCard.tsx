import { cn } from "@/lib/cn";

import type { Note } from "@/types/bible";

type NoteCardProps = {
  note: Note;
  /** Marcada como activa cuando el panel la está resaltando. */
  active?: boolean;
};

export function NoteCard({ note, active }: NoteCardProps) {
  return (
    <article
      id={`note-${note.id}`}
      className={cn(
        "rounded-lg border p-4 transition-colors",
        active
          ? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/5"
          : "border-[var(--color-rule)] bg-[var(--color-background)]",
      )}
    >
      <header className="mb-2 flex items-center gap-2 text-xs text-[var(--color-muted)]">
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)]/15 px-1.5 text-[0.7rem] font-semibold text-[var(--color-accent)]">
          {note.id}
        </span>
        <span>·</span>
        <span>v. {note.verse}</span>
      </header>
      <h4 className="mb-1.5 text-sm font-semibold text-[var(--color-ink)]">
        {note.title}
      </h4>
      {note.transcription ? (
        <p className="mb-2 font-mono text-xs text-[var(--color-muted)]">
          {note.transcription}
        </p>
      ) : null}
      <p className="text-sm leading-relaxed text-[var(--color-ink)]/85">
        {note.content}
      </p>
    </article>
  );
}
