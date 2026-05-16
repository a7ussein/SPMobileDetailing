export default function GalleryPlaceholder() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {/* TODO: Replace placeholders with real detailing photos (no stock cars) */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="aspect-square rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex items-center justify-center text-center p-4"
        >
          <span className="text-sm text-[var(--color-ink-muted)] opacity-60">
            Gallery Image {i}
          </span>
        </div>
      ))}
    </div>
  );
}
