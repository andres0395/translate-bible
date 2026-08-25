import Link from "next/link";

import { Icon } from "@/components/atoms/Icon";

type SiteHeaderProps = {
  /** Trazo de migas opcional, ej. "Génesis / 24". */
  crumbs?: Array<{ label: string; href?: string }>;
};

export function SiteHeader({ crumbs }: SiteHeaderProps) {
  return (
    <header className="border-b border-[var(--color-rule)]">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--color-ink)] hover:opacity-80"
        >
          <Icon name="book" className="h-4 w-4" />
          Biblia
        </Link>
        {crumbs && crumbs.length > 0 ? (
          <>
            <span className="text-[var(--color-muted)]">/</span>
            <nav aria-label="Migas" className="flex items-center gap-2 text-sm">
              {crumbs.map((c, i) => (
                <span
                  key={`${c.label}-${i}`}
                  className="flex items-center gap-2"
                >
                  {c.href ? (
                    <Link
                      href={c.href}
                      className="text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:underline"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-[var(--color-ink)]">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 ? (
                    <span className="text-[var(--color-muted)]">/</span>
                  ) : null}
                </span>
              ))}
            </nav>
          </>
        ) : null}
      </div>
    </header>
  );
}
