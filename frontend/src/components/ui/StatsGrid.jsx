import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Activity,
  RefreshCw,
  HardDrive,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';
import { clsx } from 'clsx';

// ─── Animated counter ───────────────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(update);
      else prev.current = target;
    };
    requestAnimationFrame(update);
  }, [target, duration]);
  return count;
}

// ─── Smooth sparkline ────────────────────────────────────────────────────────
const Sparkline = ({ data, color, glowColor }) => {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - Math.max((v / max) * 100, 5),
  }));

  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
    })
    .join(' ');

  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <div className="relative h-10 w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={`grad-${glowColor}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={areaD} fill={`url(#grad-${glowColor})`} />
        {/* Line */}
        <path d={pathD} fill="none" stroke={glowColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* End dot */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3"
          fill={glowColor}
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};

// ─── Single stat card ────────────────────────────────────────────────────────
const StatCard = ({
  title, value, suffix = '', icon: Icon,
  gradient, glowColor, accentClass,
  trend, trendLabel, sparkData, description, index,
}) => {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  const display = typeof value === 'number' ? animated : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      {/* Ambient glow on hover */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${glowColor}30, transparent 70%)` }}
      />

      <div className="relative bg-white rounded-2xl border border-slate-200/70 p-5 overflow-hidden
                      shadow-sm hover:shadow-xl hover:-translate-y-1
                      transition-all duration-300 ease-out cursor-default">

        {/* Decorative corner arc */}
        <div
          className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-[0.05] group-hover:opacity-[0.1] group-hover:scale-110 transition-all duration-500"
          style={{ background: gradient }}
        />

        {/* Top row */}
        <div className="flex items-start justify-between mb-4 relative">
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
            style={{ background: gradient }}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 to-transparent pointer-events-none" />
            <Icon size={19} className="text-white drop-shadow" />
          </div>

          {/* Trend badge */}
          {trend !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 + 0.25 }}
              className={clsx(
                'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border',
                trend > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : trend < 0
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              )}
            >
              {trend > 0 ? <TrendingUp size={10} /> : trend < 0 ? <TrendingDown size={10} /> : null}
              {trend > 0 ? '+' : ''}{trend}%
            </motion.div>
          )}
        </div>

        {/* Value + metric */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className={clsx('text-3xl font-extrabold tracking-tight leading-none', accentClass)}>
              {display}
            </span>
            {suffix && (
              <span className="text-base font-semibold text-slate-400 leading-none">{suffix}</span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-700 mt-1.5 leading-tight">{title}</p>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>

        {/* Sparkline */}
        {sparkData && (
          <Sparkline data={sparkData} glowColor={glowColor} color={accentClass} />
        )}

        {/* Footer */}
        {trendLabel && (
          <div className="mt-3 pt-3 border-t border-slate-100/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{trendLabel}</span>
            <ArrowUpRight
              size={13}
              className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Exported grid ─────────────────────────────────────────────────────────
const StatsGrid = ({ stats = {} }) => {
  const { total = 0, running = 0, pending = 0, storage = '0GB' } = stats;

  const cards = [
    {
      title: 'Total Notebooks',
      value: total,
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
      glowColor: '#6366f1',
      accentClass: 'text-indigo-700',
      trend: 12,
      trendLabel: 'vs last week',
      sparkData: [2, 3, 2, 4, 3, 5, total || 4],
      description: 'All environments',
    },
    {
      title: 'Running',
      value: running,
      icon: Activity,
      gradient: 'linear-gradient(135deg, #10b981 0%, #0891b2 100%)',
      glowColor: '#10b981',
      accentClass: running > 0 ? 'text-emerald-600' : 'text-slate-800',
      trend: running > 0 ? 5 : 0,
      trendLabel: 'Active sessions',
      sparkData: [1, 2, 1, 3, 2, 3, running || 2],
      description: 'Live Jupyter kernels',
    },
    {
      title: 'Pending',
      value: pending,
      icon: RefreshCw,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      glowColor: '#f59e0b',
      accentClass: pending > 0 ? 'text-amber-600' : 'text-slate-800',
      trend: pending > 0 ? -2 : undefined,
      trendLabel: 'Currently provisioning',
      sparkData: [0, 1, 0, 1, 2, 1, pending || 0],
      description: 'Awaiting resources',
    },
    {
      title: 'Storage Used',
      value: storage,
      icon: HardDrive,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
      glowColor: '#8b5cf6',
      accentClass: 'text-violet-700',
      trend: 8,
      trendLabel: 'Persistent volumes',
      sparkData: [1, 2, 3, 3, 4, 5, 6],
      description: 'PVC allocations',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <StatCard key={card.title} {...card} index={i} />
      ))}
    </div>
  );
};

export default StatsGrid;
