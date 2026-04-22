import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import {
  Cpu,
  Database,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { clsx } from 'clsx';

// ─── Static baseline data ────────────────────────────────────────────────────
const BASE_DATA = [
  { time: '10:00', cpu: 18, ram: 32 },
  { time: '10:15', cpu: 24, ram: 35 },
  { time: '10:30', cpu: 41, ram: 39 },
  { time: '10:45', cpu: 58, ram: 47 },
  { time: '11:00', cpu: 52, ram: 51 },
  { time: '11:15', cpu: 67, ram: 62 },
  { time: '11:30', cpu: 83, ram: 69 },
  { time: '11:45', cpu: 71, ram: 64 },
  { time: '12:00', cpu: 55, ram: 58 },
  { time: '12:15', cpu: 48, ram: 53 },
  { time: '12:30', cpu: 62, ram: 60 },
  { time: '12:45', cpu: 74, ram: 66 },
  { time: '13:00', cpu: 59, ram: 57 },
];

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, view }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-3 min-w-[160px]">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-medium text-slate-600">{entry.name}</span>
          </div>
          <span className="text-xs font-bold" style={{ color: entry.color }}>
            {entry.value}%
          </span>
        </div>
      ))}
      {/* Warning if high usage */}
      {payload.some((e) => e.value > 75) && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-amber-600">
          <AlertTriangle size={11} />
          <span className="text-[10px] font-semibold">High usage detected</span>
        </div>
      )}
    </div>
  );
};

// ─── Metric legend pill ──────────────────────────────────────────────────────
const MetricPill = ({ label, value, delta, color, dotColor, icon: Icon, onClick, active }) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left',
      active
        ? 'border-current shadow-sm'
        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm opacity-60 hover:opacity-80'
    )}
    style={active ? { borderColor: dotColor, background: `${dotColor}08` } : {}}
  >
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${dotColor}15` }}
    >
      <Icon size={17} style={{ color: dotColor }} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="text-lg font-extrabold text-slate-900">{value}%</span>
        <span
          className={clsx(
            'text-[10px] font-bold flex items-center gap-0.5',
            delta >= 0 ? 'text-red-500' : 'text-emerald-500'
          )}
        >
          {delta >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {Math.abs(delta)}%
        </span>
      </div>
    </div>
    {/* Live indicator */}
    {active && (
      <div className="ml-auto flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: dotColor }} />
      </div>
    )}
  </button>
);

// ─── Time range selector ─────────────────────────────────────────────────────
const ranges = ['1h', '3h', '6h', '12h', '24h'];

// ─── Main Component ──────────────────────────────────────────────────────────
const ResourceUsageChart = () => {
  const [data, setData] = useState(BASE_DATA);
  const [activeLines, setActiveLines] = useState({ cpu: true, ram: true });
  const [timeRange, setTimeRange] = useState('3h');
  const [isLive, setIsLive] = useState(true);
  const [lastTick, setLastTick] = useState(null);

  // Simulate live data by nudging the last point every 4 seconds
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const now = new Date();
        const label = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        const newCpu = Math.max(5, Math.min(95, last.cpu + (Math.random() * 14 - 7)));
        const newRam = Math.max(5, Math.min(95, last.ram + (Math.random() * 10 - 5)));
        const updated = [...prev.slice(-12), { time: label, cpu: Math.round(newCpu), ram: Math.round(newRam) }];
        setLastTick(now.toLocaleTimeString());
        return updated;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [isLive]);

  const toggleLine = (key) => {
    // Prevent both being off
    const next = { ...activeLines, [key]: !activeLines[key] };
    if (!next.cpu && !next.ram) return;
    setActiveLines(next);
  };

  const lastPoint = data[data.length - 1] ?? { cpu: 0, ram: 0 };
  const prevPoint = data[data.length - 2] ?? lastPoint;
  const cpuDelta = lastPoint.cpu - prevPoint.cpu;
  const ramDelta = lastPoint.ram - prevPoint.ram;

  // Threshold line — warn at 80%
  const WARN_THRESHOLD = 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden"
    >
      {/* ── Card Header ───────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
              <Activity size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Resource Usage</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                CPU &amp; RAM utilization over time
                {lastTick && (
                  <span className="ml-2 text-emerald-500 font-medium">· updated {lastTick}</span>
                )}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live toggle */}
            <button
              onClick={() => setIsLive((v) => !v)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                isLive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
              )}
            >
              <span className={clsx('w-1.5 h-1.5 rounded-full', isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} />
              {isLive ? 'Live' : 'Paused'}
            </button>

            {/* Time range pills */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                    timeRange === r
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={() => setData(BASE_DATA)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
              title="Reset data"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ── Metric Pills ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mt-4">
          <MetricPill
            label="CPU Usage"
            value={lastPoint.cpu}
            delta={cpuDelta}
            icon={Cpu}
            dotColor="#6366f1"
            active={activeLines.cpu}
            onClick={() => toggleLine('cpu')}
          />
          <MetricPill
            label="RAM Usage"
            value={lastPoint.ram}
            delta={ramDelta}
            icon={Database}
            dotColor="#8b5cf6"
            active={activeLines.ram}
            onClick={() => toggleLine('ram')}
          />
        </div>
      </div>

      {/* ── Chart body ────────────────────────────────────────────────────── */}
      <div className="px-2 pt-4 pb-3">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
            <defs>
              {/* CPU gradient */}
              <linearGradient id="rcCpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
              </linearGradient>
              {/* RAM gradient */}
              <linearGradient id="rcRamGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#f1f5f9"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontWeight: 500 }}
              interval="preserveStartEnd"
            />

            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontWeight: 500 }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              width={38}
            />

            {/* Warning threshold line */}
            <ReferenceLine
              y={WARN_THRESHOLD}
              stroke="#f59e0b"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: '⚠ 80%',
                position: 'insideTopRight',
                fontSize: 10,
                fill: '#f59e0b',
                fontWeight: 700,
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: '#e2e8f0',
                strokeWidth: 1.5,
                strokeDasharray: '4 2',
              }}
            />

            {/* CPU Area + Line */}
            {activeLines.cpu && (
              <Area
                type="monotoneX"
                dataKey="cpu"
                name="CPU"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#rcCpuGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: '#6366f1',
                  stroke: '#fff',
                  strokeWidth: 2,
                  filter: 'drop-shadow(0 0 4px #6366f180)',
                }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            )}

            {/* RAM Area + Line */}
            {activeLines.ram && (
              <Area
                type="monotoneX"
                dataKey="ram"
                name="RAM"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#rcRamGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: '#8b5cf6',
                  stroke: '#fff',
                  strokeWidth: 2,
                  filter: 'drop-shadow(0 0 4px #8b5cf680)',
                }}
                animationDuration={900}
                animationEasing="ease-out"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Footer stats bar ──────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'CPU Avg', value: `${Math.round(data.reduce((s, d) => s + d.cpu, 0) / data.length)}%`, color: 'text-indigo-600' },
            { label: 'CPU Peak', value: `${Math.max(...data.map((d) => d.cpu))}%`, color: 'text-indigo-700' },
            { label: 'RAM Avg', value: `${Math.round(data.reduce((s, d) => s + d.ram, 0) / data.length)}%`, color: 'text-violet-600' },
            { label: 'RAM Peak', value: `${Math.max(...data.map((d) => d.ram))}%`, color: 'text-violet-700' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className={clsx('text-sm font-extrabold mt-0.5', stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceUsageChart;
