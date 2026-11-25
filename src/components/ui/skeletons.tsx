/** Route-shaped loading placeholders: the layout appears instantly, then fills in. */
export function ListSkeleton({ rows = 5, header = true }: { rows?: number; header?: boolean }) {
  return (
    <div className="space-y-5" aria-busy="true">
      {header && <div className="skeleton h-9 w-56 rounded-xl" />}
      <div className="surface divide-y divide-line overflow-hidden rounded-2xl">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-2/5 rounded" />
              <div className="skeleton h-2.5 w-3/5 rounded" />
            </div>
            <div className="skeleton h-4 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PodiumSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="skeleton h-9 w-48 rounded-xl" />
      <div className="skeleton h-10 w-full rounded-xl" />
      <div className="flex items-end justify-center gap-3">
        <div className="skeleton h-28 w-24 rounded-2xl" />
        <div className="skeleton h-36 w-24 rounded-2xl" />
        <div className="skeleton h-24 w-24 rounded-2xl" />
      </div>
      <ListSkeleton rows={5} header={false} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="skeleton h-6 w-48 rounded-lg" />
      </div>
      <div className="skeleton h-40 rounded-3xl" />
      <div className="skeleton h-24 rounded-2xl" />
      <ListSkeleton rows={3} header={false} />
    </div>
  );
}

export function ProxiSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="skeleton mx-auto h-56 w-56 rounded-full" />
      <div className="skeleton mx-auto h-4 w-40 rounded" />
      <div className="skeleton h-3 w-full rounded-full" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton aspect-square rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
