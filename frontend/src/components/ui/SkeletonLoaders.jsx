import { clsx } from 'clsx';

// ─── Base shimmer ─────────────────────────────────────────────────────────────
export const Shimmer = ({ className, style }) => (
  <div className={clsx('skeleton-shimmer rounded-xl', className)} style={style} />
);

// ─── Text lines ───────────────────────────────────────────────────────────────
export const SkeletonText = ({ lines = 2, className }) => (
  <div className={clsx('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Shimmer key={i} className={clsx('h-3', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')} />
    ))}
  </div>
);

// ─── Stat card ────────────────────────────────────────────────────────────────
export const SkeletonStatCard = ({ className }) => (
  <div className={clsx('bg-white rounded-2xl border border-slate-200/70 p-5', className)}>
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2 flex-1">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-8 w-16" />
        <Shimmer className="h-2.5 w-20" />
      </div>
      <Shimmer className="w-11 h-11 rounded-xl flex-shrink-0" />
    </div>
    <div className="flex items-end gap-1 h-8 mt-4">
      {[60, 40, 70, 55, 80, 65, 75].map((h, i) => (
        <Shimmer key={i} className="flex-1 rounded-sm" style={{ height: `${h}%` }} />
      ))}
    </div>
    <Shimmer className="h-2.5 w-28 mt-3" />
  </div>
);

// ─── Table rows ───────────────────────────────────────────────────────────────
export const SkeletonTableRows = ({ rows = 4 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i} className="border-b border-slate-50">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Shimmer className="w-9 h-9 rounded-xl flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Shimmer className="h-3.5 w-36" />
              <Shimmer className="h-2.5 w-20" />
            </div>
          </div>
        </td>
        <td className="px-4 py-4"><Shimmer className="h-6 w-20 rounded-full" /></td>
        <td className="px-4 py-4"><Shimmer className="h-6 w-14 rounded-lg" /></td>
        <td className="px-4 py-4"><Shimmer className="h-6 w-16 rounded-lg" /></td>
        <td className="px-4 py-4"><Shimmer className="h-6 w-12 rounded-lg" /></td>
        <td className="px-4 py-4">
          <div className="flex justify-end gap-2">
            <Shimmer className="h-7 w-16 rounded-lg" />
            <Shimmer className="h-7 w-20 rounded-lg" />
            <Shimmer className="h-7 w-14 rounded-lg" />
          </div>
        </td>
      </tr>
    ))}
  </>
);

// ─── Activity rows ────────────────────────────────────────────────────────────
export const SkeletonActivity = ({ rows = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-3">
        <Shimmer className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <Shimmer className="h-3 w-24 rounded-full" />
          <Shimmer className="h-3.5 w-40" />
        </div>
        <Shimmer className="h-3 w-12 mt-1" />
      </div>
    ))}
  </div>
);

// ─── Generic card ─────────────────────────────────────────────────────────────
export const SkeletonCard = ({ className, lines = 3 }) => (
  <div className={clsx('bg-white rounded-2xl border border-slate-200/70 p-5 space-y-4', className)}>
    <div className="flex items-center gap-3">
      <Shimmer className="w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Shimmer className="h-3.5 w-32" />
        <Shimmer className="h-2.5 w-20" />
      </div>
    </div>
    <SkeletonText lines={lines} />
  </div>
);
