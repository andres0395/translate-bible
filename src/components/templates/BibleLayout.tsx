import { SiteHeader } from "@/components/organisms/SiteHeader";

type BibleLayoutProps = {
  children: React.ReactNode;
  crumbs?: Array<{ label: string; href?: string }>;
};

/**
 * Layout shell para todas las páginas de la Biblia.
 * Header con migas, contenedor centrado, footer minimalista.
 */
export function BibleLayout({ children, crumbs }: BibleLayoutProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader crumbs={crumbs} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:py-14">
        {children}
      </main>
      <footer className="border-t border-[var(--color-rule)] py-6 text-center text-xs text-[var(--color-muted)]">
        Traducción contextual · sin afiliación doctrinal
      </footer>
    </div>
  );
}
