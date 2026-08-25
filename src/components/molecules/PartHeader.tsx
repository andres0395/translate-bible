type PartHeaderProps = {
  index: number;
  range: readonly [number, number];
};

export function PartHeader({ index, range }: PartHeaderProps) {
  return (
    <div className="my-8 flex items-center gap-4 first:mt-0">
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        Parte {index}
      </span>
      <span className="h-px flex-1 bg-[var(--color-rule)]" />
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        vv. {range[0]}–{range[1]}
      </span>
    </div>
  );
}
