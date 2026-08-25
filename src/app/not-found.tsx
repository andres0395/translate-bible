import Link from "next/link";

import { BibleLayout } from "@/components/templates/BibleLayout";

export default function NotFound() {
  return (
    <BibleLayout>
      <div className="py-20 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          404
        </p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          No encontramos ese texto
        </h1>
        <p className="mx-auto mb-8 max-w-md text-[var(--color-muted)]">
          El libro o capítulo que buscás no existe, o todavía no fue
          traducido.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--color-rule)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-rule)]/30"
        >
          Volver al inicio
        </Link>
      </div>
    </BibleLayout>
  );
}
