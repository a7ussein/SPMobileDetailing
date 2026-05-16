export default function BeforeAfterPlaceholder() {
  return (
    <div className="card relative aspect-[4/3] w-full overflow-hidden md:aspect-video">
      {/* TODO: Replace with actual before/after image slider using real photos from Ahmad */}
      <div className="absolute inset-0 flex">
        <div className="flex h-full w-1/2 flex-col items-center justify-center border-r border-[var(--color-border)] bg-black/40 p-6 text-center">
          <span className="mb-3 inline-flex items-center rounded-sm bg-[var(--color-ink)] px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-bg)]">
            Before
          </span>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Swirl marks &amp; oxidation
          </p>
        </div>
        <div className="flex h-full w-1/2 flex-col items-center justify-center bg-[var(--color-surface-raised)] p-6 text-center">
          <span className="mb-3 inline-flex items-center rounded-sm bg-[var(--color-accent)] px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-white">
            After
          </span>
          <p className="text-sm text-[var(--color-ink)]">
            Flawless gloss finish
          </p>
        </div>
      </div>
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--color-accent)]" />
      <div className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-sm border border-[var(--color-accent)] bg-[var(--color-bg)] shadow-lg">
        <svg
          className="h-4 w-4 text-[var(--color-accent)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      </div>
    </div>
  );
}
