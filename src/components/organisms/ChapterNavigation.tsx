import Link from "next/link";

import { Icon } from "@/components/atoms/Icon";

import type { ChapterNavigation } from "@/services/bible";

type ChapterNavigationProps = {
  navigation: ChapterNavigation;
  currentLabel: string;
};

export function ChapterNav({
  navigation,
  currentLabel,
}: ChapterNavigationProps) {
  return (
    <nav
      aria-label="Navegación entre capítulos"
      className="mt-12 flex items-center justify-between gap-4 border-t border-[var(--color-rule)] pt-6"
    >
      <div className="flex-1">
        {navigation.prev ? (
          <Link
            href={`/${navigation.prev.bookId}/${navigation.prev.chapter}`}
            className="group inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <Icon
              name="chevron-left"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            />
            <span className="flex flex-col">
              <span className="text-xs uppercase tracking-wider">Anterior</span>
              <span className="font-medium text-[var(--color-ink)]">
                {navigation.prev.chapter}
              </span>
            </span>
          </Link>
        ) : (
          <span className="text-xs text-[var(--color-muted)]/60">Inicio</span>
        )}
      </div>
      <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
        {currentLabel}
      </div>
      <div className="flex-1 text-right">
        {navigation.next ? (
          <Link
            href={`/${navigation.next.bookId}/${navigation.next.chapter}`}
            className="group inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <span className="flex flex-col">
              <span className="text-xs uppercase tracking-wider">Siguiente</span>
              <span className="font-medium text-[var(--color-ink)]">
                {navigation.next.chapter}
              </span>
            </span>
            <Icon
              name="chevron-right"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ) : (
          <span className="text-xs text-[var(--color-muted)]/60">Fin</span>
        )}
      </div>
    </nav>
  );
}
