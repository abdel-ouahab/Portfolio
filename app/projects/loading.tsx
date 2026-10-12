export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading projects</span>
      <div className="h-4 w-28 animate-pulse rounded bg-surface-sunken" />
      <div className="mt-8 h-10 w-64 animate-pulse rounded bg-surface-sunken" />
      <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-surface-sunken" />
      <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="mx-auto aspect-[340/326] w-full max-w-[340px] animate-pulse rounded-3xl bg-surface-sunken" />
        ))}
      </div>
    </div>
  );
}
