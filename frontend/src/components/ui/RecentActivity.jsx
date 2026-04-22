import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  PlayCircle,
  Trash2,
  StopCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Layers,
  ChevronDown,
  SlidersHorizontal,
  BellDot,
} from 'lucide-react';
import { clsx } from 'clsx';

// ─── Event type configuration ────────────────────────────────────────────────
const EVENT_TYPES = {
  created: {
    label: 'Notebook Created',
    icon: PlusCircle,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    dotColor: 'bg-indigo-500',
    ringColor: 'ring-indigo-200',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
  started: {
    label: 'Notebook Started',
    icon: PlayCircle,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    dotColor: 'bg-emerald-500',
    ringColor: 'ring-emerald-200',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  stopped: {
    label: 'Notebook Stopped',
    icon: StopCircle,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    dotColor: 'bg-amber-500',
    ringColor: 'ring-amber-200',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  deleted: {
    label: 'Notebook Deleted',
    icon: Trash2,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
    dotColor: 'bg-red-500',
    ringColor: 'ring-red-200',
    badgeBg: 'bg-red-50 text-red-700 border-red-100',
  },
  failed: {
    label: 'Notebook Failed',
    icon: AlertTriangle,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    dotColor: 'bg-rose-500',
    ringColor: 'ring-rose-200',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  reconnected: {
    label: 'Reconnected',
    icon: RefreshCw,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    dotColor: 'bg-blue-500',
    ringColor: 'ring-blue-200',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
  },
};

// ─── Default seed data (fallback when no live data) ──────────────────────────
const SEED_EVENTS = [
  { id: 's1', type: 'created',     name: 'Deep Learning Lab',  ts: Date.now() - 2 * 60000 },
  { id: 's2', type: 'started',     name: 'Deep Learning Lab',  ts: Date.now() - 1.5 * 60000 },
  { id: 's3', type: 'created',     name: 'NLP Research',       ts: Date.now() - 18 * 60000 },
  { id: 's4', type: 'stopped',     name: 'CV Pipeline',        ts: Date.now() - 45 * 60000 },
  { id: 's5', type: 'deleted',     name: 'Old Experiment',     ts: Date.now() - 2 * 3600000 },
  { id: 's6', type: 'started',     name: 'NLP Research',       ts: Date.now() - 3 * 3600000 },
  { id: 's7', type: 'reconnected', name: 'Data Analysis',      ts: Date.now() - 5 * 3600000 },
  { id: 's8', type: 'failed',      name: 'GPU Cluster Test',   ts: Date.now() - 8 * 3600000 },
];

// ─── Relative timestamp ──────────────────────────────────────────────────────
function relativeTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5)   return 'just now';
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Single activity row ─────────────────────────────────────────────────────
const ActivityRow = ({ event, isLast }) => {
  const cfg = EVENT_TYPES[event.type] ?? EVENT_TYPES.created;
  const Icon = cfg.icon;
  const [, forceUpdate] = useState(0);

  // Keep relative time ticking
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex gap-3 group"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Icon dot with ring */}
        <div
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center ring-4 transition-all duration-300 group-hover:scale-110',
            cfg.iconBg,
            cfg.ringColor
          )}
        >
          <Icon size={14} className={clsx(cfg.iconColor, event.type === 'reconnected' && 'group-hover:animate-spin')} />
        </div>
        {/* Vertical connector */}
        {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1.5 mb-0.5 min-h-[16px]" />}
      </div>

      {/* Content */}
      <div className={clsx('pb-4 flex-1 min-w-0', isLast && 'pb-0')}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {/* Event type badge */}
            <span
              className={clsx(
                'inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1',
                cfg.badgeBg
              )}
            >
              {cfg.label}
            </span>
            {/* Notebook name */}
            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
              {event.name}
            </p>
            {/* Optional sub-message */}
            {event.message && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{event.message}</p>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-1">
            <Clock size={10} />
            {relativeTime(event.ts)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const RecentActivity = ({ notebooks = [] }) => {
  const [events, setEvents]       = useState(SEED_EVENTS);
  const [filter, setFilter]       = useState('all');
  const [showAll, setShowAll]     = useState(false);
  const [newCount, setNewCount]   = useState(0);
  const prevNotebooks             = useRef([]);
  const VISIBLE_COUNT             = 6;

  // Generate events from notebook state changes
  useEffect(() => {
    if (!notebooks.length) return;

    const prev   = prevNotebooks.current;
    const prevIds = new Set(prev.map((n) => n._id));
    const curIds  = new Set(notebooks.map((n) => n._id));
    const newEvts = [];

    notebooks.forEach((nb) => {
      if (!prevIds.has(nb._id)) {
        // New notebook appeared → created
        newEvts.push({ id: `${nb._id}-created-${Date.now()}`, type: 'created', name: nb.name, ts: Date.now() });
      } else {
        // Status changed
        const old = prev.find((p) => p._id === nb._id);
        if (old && old.status !== nb.status) {
          const typeMap = {
            Running: 'started',
            Stopped: 'stopped',
            Failed:  'failed',
            Pending: 'reconnected',
          };
          const type = typeMap[nb.status];
          if (type) newEvts.push({ id: `${nb._id}-${type}-${Date.now()}`, type, name: nb.name, ts: Date.now() });
        }
      }
    });

    prev.forEach((nb) => {
      if (!curIds.has(nb._id)) {
        newEvts.push({ id: `${nb._id}-deleted-${Date.now()}`, type: 'deleted', name: nb.name, ts: Date.now() });
      }
    });

    if (newEvts.length > 0) {
      setEvents((e) => [...newEvts, ...e].slice(0, 50));
      setNewCount((c) => c + newEvts.length);
    }

    prevNotebooks.current = notebooks;
  }, [notebooks]);

  const typeOptions = ['all', 'created', 'started', 'stopped', 'deleted', 'failed'];

  const filtered = events.filter((e) => filter === 'all' || e.type === filter);
  const visible  = showAll ? filtered : filtered.slice(0, VISIBLE_COUNT);
  const hasMore  = filtered.length > VISIBLE_COUNT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
      className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col"
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/25 flex-shrink-0">
              <Layers size={16} className="text-white" />
              {newCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {newCount > 9 ? '9+' : newCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Recent Activity
                {newCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full"
                  >
                    {newCount} new
                  </motion.span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {events.length} events tracked
              </p>
            </div>
          </div>

          {/* Clear badge */}
          {newCount > 0 && (
            <button
              onClick={() => setNewCount(0)}
              className="text-[11px] text-slate-400 hover:text-slate-700 font-medium border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 transition-all"
            >
              Mark read
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-1.5">
          {typeOptions.map((opt) => {
            const cfg = opt === 'all' ? null : EVENT_TYPES[opt];
            const count = opt === 'all' ? events.length : events.filter((e) => e.type === opt).length;
            return (
              <button
                key={opt}
                onClick={() => { setFilter(opt); setShowAll(false); }}
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all',
                  filter === opt
                    ? opt === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : `border-current ${cfg?.badgeBg}`
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                )}
              >
                {cfg && (
                  <span
                    className={clsx('w-1.5 h-1.5 rounded-full', cfg.dotColor)}
                  />
                )}
                <span className="capitalize">{opt}</span>
                {count > 0 && (
                  <span className="ml-0.5 opacity-60">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Timeline list ────────────────────────────────────────────── */}
      <div className="px-5 pt-4 flex-1 overflow-y-auto max-h-[420px] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
        {visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <BellDot size={20} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No activity yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Events will appear here as you create and manage notebooks.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {visible.map((event, i) => (
              <ActivityRow
                key={event.id}
                event={event}
                isLast={i === visible.length - 1}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      {hasMore && (
        <div className="px-5 pb-4 pt-2 border-t border-slate-50">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
          >
            <ChevronDown
              size={14}
              className={clsx('transition-transform duration-300', showAll && 'rotate-180')}
            />
            {showAll
              ? 'Show less'
              : `Show ${filtered.length - VISIBLE_COUNT} more events`}
          </button>
        </div>
      )}

      {/* Live indicator */}
      <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live feed active
        </span>
        <span className="text-[11px] text-slate-400">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </motion.div>
  );
};

export default RecentActivity;
