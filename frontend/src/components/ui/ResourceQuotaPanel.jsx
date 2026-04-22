import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Database,
  HardDrive,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Server,
  Network,
  Gauge,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

// ─── Cluster services config ─────────────────────────────────────────────────
const SERVICES = [
  { id: 'api',      label: 'API Server',      latency: '12ms',  icon: Server,   healthy: true  },
  { id: 'sched',   label: 'Scheduler',       latency: '8ms',   icon: Cpu,      healthy: true  },
  { id: 'etcd',    label: 'etcd Store',      latency: '5ms',   icon: Database, healthy: true  },
  { id: 'net',     label: 'Network Fabric',  latency: '2ms',   icon: Network,  healthy: true  },
];

// ─── Health status pill ───────────────────────────────────────────────────────
const StatusPill = ({ healthy, degraded }) => {
  if (degraded) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
      <AlertTriangle size={11} />Degraded
    </span>
  );
  if (!healthy) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
      <XCircle size={11} />Unhealthy
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Healthy
    </span>
  );
};

// ─── GCP‑style progress bar ───────────────────────────────────────────────────
const QuotaProgressBar = ({
  label,
  sublabel,
  used,
  total,
  unit = '',
  icon: Icon,
  gradient,
  warnAt = 70,
  critAt = 90,
}) => {
  const raw = total > 0 ? (used / total) * 100 : 0;
  const pct = Math.min(raw, 100);
  const isCrit = pct >= critAt;
  const isWarn = pct >= warnAt && pct < critAt;
  const isOver = used > total;

  const barColor = isCrit
    ? 'bg-gradient-to-r from-red-400 to-rose-500'
    : isWarn
    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
    : gradient;

  const textColor = isCrit ? 'text-red-600' : isWarn ? 'text-amber-600' : 'text-slate-800';
  const pctColor  = isCrit ? 'text-red-500' : isWarn ? 'text-amber-500' : 'text-indigo-600';

  return (
    <div className="group">
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={clsx(
            'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
            isCrit ? 'bg-red-50' : isWarn ? 'bg-amber-50' : 'bg-slate-100'
          )}>
            <Icon size={14} className={clsx(
              isCrit ? 'text-red-500' : isWarn ? 'text-amber-500' : 'text-slate-500'
            )} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">{label}</p>
            {sublabel && <p className="text-[10px] text-slate-400">{sublabel}</p>}
          </div>
        </div>
        <div className="text-right">
          <span className={clsx('text-sm font-bold tabular-nums', textColor)}>
            {typeof used === 'number' ? used.toFixed(1) : used}
            <span className="text-slate-400 font-normal text-xs"> / {total}{unit}</span>
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          className={clsx('absolute inset-y-0 left-0 rounded-full', barColor)}
        />
        {/* Subtle inner shine */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          className="absolute inset-y-0 left-0 rounded-full bg-white/20"
          style={{ height: '40%', top: 0 }}
        />
      </div>

      {/* Below-bar row */}
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-2">
          {/* Warn / Crit badges */}
          {isCrit && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
              <AlertTriangle size={10} />Over limit
            </span>
          )}
          {isWarn && !isCrit && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
              <AlertTriangle size={10} />High usage
            </span>
          )}
        </div>
        <span className={clsx('text-[11px] font-bold tabular-nums', pctColor)}>
          {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

// ─── Service health row ───────────────────────────────────────────────────────
const ServiceRow = ({ service, index }) => {
  const Icon = service.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.06 }}
      className="flex items-center justify-between py-2 group"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
          <Icon size={12} className="text-slate-500 group-hover:text-indigo-500 transition-colors" />
        </div>
        <span className="text-xs font-medium text-slate-600">{service.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-400 font-mono">{service.latency}</span>
        <span className={clsx(
          'w-2 h-2 rounded-full',
          service.healthy ? 'bg-emerald-500' : 'bg-red-500',
          service.healthy && 'animate-pulse'
        )} />
      </div>
    </motion.div>
  );
};

// ─── Uptime sparkline (pure CSS) ─────────────────────────────────────────────
const UptimeBar = ({ buckets }) => (
  <div className="flex items-end gap-0.5 h-8">
    {buckets.map((val, i) => (
      <div
        key={i}
        className={clsx(
          'flex-1 rounded-sm transition-all',
          val === 1 ? 'bg-emerald-400' : val === 0.5 ? 'bg-amber-400' : 'bg-red-400'
        )}
        style={{ height: `${val * 100}%` }}
        title={val === 1 ? 'Healthy' : val === 0.5 ? 'Degraded' : 'Down'}
      />
    ))}
  </div>
);

// ─── Generate simple uptime buckets (last 30 "ticks") ───────────────────────
const UPTIME = Array.from({ length: 30 }, (_, i) =>
  i < 27 ? 1 : i === 27 ? 0.5 : 1
);

// ─── Main Panel ──────────────────────────────────────────────────────────────
const ResourceQuotaPanel = ({ cpuUsed = 0, ramUsed = 0, storageUsed = 0 }) => {
  const [lastChecked, setLastChecked] = useState(new Date());
  const [checking, setChecking]       = useState(false);
  const [uptime]                      = useState('99.94%');

  const QUOTA = { cpu: 4, ram: 16, storage: 50 };

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setLastChecked(new Date());
    }, 1200);
  };

  const allHealthy = SERVICES.every((s) => s.healthy);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
      className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col h-full"
    >
      {/* ── Cluster Health Banner ────────────────────────────────────── */}
      <div className={clsx(
        'px-5 py-4 border-b border-slate-100',
        allHealthy
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50'
          : 'bg-gradient-to-r from-red-50 to-rose-50/50'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Animated health orb */}
            <div className={clsx(
              'relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              allHealthy
                ? 'bg-emerald-100'
                : 'bg-red-100'
            )}>
              <CheckCircle2 size={20} className={allHealthy ? 'text-emerald-600' : 'text-red-500'} />
              {allHealthy && (
                <span className="absolute inset-0 rounded-xl bg-emerald-400/20 animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Cluster Status</h2>
                <StatusPill healthy={allHealthy} />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Last checked: {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={checking}
            className="p-2 rounded-xl border border-slate-200 bg-white/80 text-slate-500 hover:text-slate-800 hover:bg-white hover:border-slate-300 transition-all disabled:opacity-50"
            title="Re-check health"
          >
            <RefreshCw size={14} className={clsx(checking && 'animate-spin')} />
          </button>
        </div>

        {/* Uptime bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">30-day Uptime</span>
            <span className="text-[11px] font-bold text-emerald-600">{uptime}</span>
          </div>
          <UptimeBar buckets={UPTIME} />
          <div className="flex justify-between text-[9px] text-slate-400 mt-1">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* ── Resource Quota Bars ──────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Resource Quota</h3>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">Your limits</span>
        </div>

        <div className="space-y-5">
          <QuotaProgressBar
            label="CPU Cores"
            sublabel={`${cpuUsed.toFixed(1)} cores allocated`}
            used={cpuUsed}
            total={QUOTA.cpu}
            unit=" cores"
            icon={Cpu}
            gradient="bg-gradient-to-r from-blue-400 to-indigo-500"
            warnAt={70}
            critAt={90}
          />
          <QuotaProgressBar
            label="Memory"
            sublabel={`${ramUsed.toFixed(1)} GiB allocated`}
            used={ramUsed}
            total={QUOTA.ram}
            unit=" GiB"
            icon={Database}
            gradient="bg-gradient-to-r from-violet-400 to-purple-500"
            warnAt={70}
            critAt={90}
          />
          <QuotaProgressBar
            label="Storage"
            sublabel="Persistent volume claims"
            used={storageUsed}
            total={QUOTA.storage}
            unit=" GiB"
            icon={HardDrive}
            gradient="bg-gradient-to-r from-teal-400 to-cyan-500"
            warnAt={75}
            critAt={90}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-slate-100 my-3" />

      {/* ── Service Health ───────────────────────────────────────────── */}
      <div className="px-5 pb-4 flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Server size={13} className="text-slate-400" />
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Services</h3>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {SERVICES.filter(s=>s.healthy).length}/{SERVICES.length} Online
          </span>
        </div>
        <div className="divide-y divide-slate-50">
          {SERVICES.map((svc, i) => (
            <ServiceRow key={svc.id} service={svc} index={i} />
          ))}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Auto-refreshing every 10s
        </span>
        <button className="flex items-center gap-0.5 text-[11px] text-indigo-500 font-semibold hover:text-indigo-700 transition-colors">
          View details <ChevronRight size={11} />
        </button>
      </div>
    </motion.div>
  );
};

export default ResourceQuotaPanel;
