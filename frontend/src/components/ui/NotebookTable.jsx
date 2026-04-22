import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  RotateCcw,
  Trash2,
  Cpu,
  Database,
  HardDrive,
  Zap,
  Clock,
  Terminal,
  Plus,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreVertical,
  CheckCircle2,
  Loader2,
  XCircle,
  PauseCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

// ─── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Running: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    pulse: true,
  },
  Pending: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: Loader2,
    pulse: false,
    spin: true,
  },
  Creating: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    icon: Loader2,
    pulse: false,
    spin: true,
  },
  Stopped: {
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    icon: PauseCircle,
    pulse: false,
  },
  Failed: {
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    icon: XCircle,
    pulse: false,
  },
};

// ─── Status badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Stopped;
  const Icon = cfg.icon;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap',
        cfg.badge
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot, cfg.pulse && 'animate-pulse')} />
      {status}
    </span>
  );
};

// ─── Resource chip ────────────────────────────────────────────────────────────
const ResourceChip = ({ icon: Icon, value, color, bgColor }) => (
  <div className={clsx('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold', bgColor)}>
    <Icon size={11} className={color} />
    <span className={color}>{value || '—'}</span>
  </div>
);

// ─── Action button ────────────────────────────────────────────────────────────
const ActionBtn = ({ onClick, variant = 'ghost', icon: Icon, label, disabled }) => {
  const styles = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/25 border-transparent',
    warning:
      'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300',
    danger:
      'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300',
    ghost:
      'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
        styles[variant]
      )}
    >
      <Icon size={13} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

// ─── Sortable column header ───────────────────────────────────────────────────
const SortableHeader = ({ label, field, sortField, sortDir, onSort }) => {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 cursor-pointer hover:text-slate-800 select-none whitespace-nowrap group"
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="text-slate-300 group-hover:text-slate-500 transition-colors">
          {active ? (
            sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
          ) : (
            <ChevronsUpDown size={12} />
          )}
        </span>
      </div>
    </th>
  );
};

// ─── Skeleton loader rows ─────────────────────────────────────────────────────
const SkeletonRows = () =>
  [1, 2, 3, 4].map((i) => (
    <tr key={i} className="border-b border-slate-50">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="skeleton-shimmer h-3.5 rounded-lg w-36" />
            <div className="skeleton-shimmer h-2.5 rounded-lg w-20" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4"><div className="skeleton-shimmer h-6 rounded-full w-20" /></td>
      <td className="px-4 py-4"><div className="skeleton-shimmer h-6 rounded-lg w-14" /></td>
      <td className="px-4 py-4"><div className="skeleton-shimmer h-6 rounded-lg w-16" /></td>
      <td className="px-4 py-4"><div className="skeleton-shimmer h-6 rounded-lg w-12" /></td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-2">
          <div className="skeleton-shimmer h-7 rounded-lg w-16" />
          <div className="skeleton-shimmer h-7 rounded-lg w-20" />
          <div className="skeleton-shimmer h-7 rounded-lg w-14" />
        </div>
      </td>
    </tr>
  ));

// ─── Main Table Component ─────────────────────────────────────────────────────
const NotebookTable = ({
  notebooks = [],
  isLoading = false,
  onOpen,
  onReconnect,
  onDelete,
  onCreateNew,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [actionMenu, setActionMenu] = useState(null); // id of row with open menu

  const statuses = ['All', 'Running', 'Pending', 'Stopped', 'Failed'];

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  // Filter + sort
  const filtered = notebooks
    .filter((nb) => {
      const matchSearch = nb.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || nb.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'name') return dir * (a.name ?? '').localeCompare(b.name ?? '');
      if (sortField === 'status') return dir * (a.status ?? '').localeCompare(b.status ?? '');
      if (sortField === 'createdAt') return dir * (new Date(a.createdAt) - new Date(b.createdAt));
      return 0;
    });

  const isRunning = (nb) => nb.status === 'Running';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">

      {/* ── Table Header bar ─────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <Terminal size={15} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              My Notebooks
              <span className="bg-indigo-100 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {notebooks.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">All ML environments</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notebooks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all w-44"
            />
          </div>

          {/* Status filter */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={clsx(
                  'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all',
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <SortableHeader label="Notebook Name" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">CPU</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">RAM</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">Storage</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <SkeletonRows />
            ) : filtered.length === 0 ? (
              /* ── Empty state ── */
              <tr>
                <td colSpan={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                      <Terminal size={26} className="text-indigo-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1">
                      {search || statusFilter !== 'All' ? 'No matching notebooks' : 'No notebooks yet'}
                    </p>
                    <p className="text-xs text-slate-400 mb-5 max-w-xs">
                      {search || statusFilter !== 'All'
                        ? 'Try adjusting your search or filter.'
                        : 'Spin up your first ML environment with custom CPU, RAM, and GPU resources.'}
                    </p>
                    {!search && statusFilter === 'All' && onCreateNew && (
                      <button
                        onClick={onCreateNew}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700 transition-all"
                      >
                        <Plus size={15} />
                        Create Your First Notebook
                      </button>
                    )}
                  </motion.div>
                </td>
              </tr>
            ) : (
              /* ── Data rows ── */
              <AnimatePresence>
                {filtered.map((nb, i) => (
                  <motion.tr
                    key={nb._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="group hover:bg-slate-50/70 transition-colors duration-150 border-b border-slate-50 last:border-0"
                  >
                    {/* Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={clsx(
                          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                          isRunning(nb)
                            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20'
                            : 'bg-slate-100'
                        )}>
                          <Terminal size={15} className={isRunning(nb) ? 'text-white' : 'text-slate-500'} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {nb.name}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                            #{nb._id?.substring(0, 8)}
                            {nb.gpu && (
                              <span className="ml-2 inline-flex items-center gap-1 text-amber-600 font-sans non-mono">
                                <Zap size={9} />GPU
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={nb.status} />
                    </td>

                    {/* CPU */}
                    <td className="px-4 py-3.5">
                      <ResourceChip
                        icon={Cpu}
                        value={nb.cpu}
                        color="text-blue-700"
                        bgColor="bg-blue-50 border border-blue-100"
                      />
                    </td>

                    {/* RAM */}
                    <td className="px-4 py-3.5">
                      <ResourceChip
                        icon={Database}
                        value={nb.memory}
                        color="text-violet-700"
                        bgColor="bg-violet-50 border border-violet-100"
                      />
                    </td>

                    {/* Storage */}
                    <td className="px-4 py-3.5">
                      <ResourceChip
                        icon={HardDrive}
                        value={nb.storage || '1Gi'}
                        color="text-slate-600"
                        bgColor="bg-slate-100 border border-slate-200"
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Open — primary, only when Running */}
                        {isRunning(nb) && (
                          <ActionBtn
                            onClick={() => onOpen?.(nb._id)}
                            variant="primary"
                            icon={ExternalLink}
                            label="Open"
                          />
                        )}

                        {/* Reconnect — warning, only when not Running */}
                        {!isRunning(nb) && nb.status !== 'Failed' && (
                          <ActionBtn
                            onClick={() => onReconnect?.(nb._id)}
                            variant="warning"
                            icon={RotateCcw}
                            label="Reconnect"
                            disabled={nb.status === 'Pending' || nb.status === 'Creating'}
                          />
                        )}

                        {/* Delete — always danger */}
                        <ActionBtn
                          onClick={() => onDelete?.(nb._id)}
                          variant="danger"
                          icon={Trash2}
                          label="Delete"
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      {!isLoading && filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
          <p className="text-xs text-slate-400">
            Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-600">{notebooks.length}</span> notebooks
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {/* Status summary dots */}
            {['Running', 'Pending', 'Stopped'].map((s) => {
              const count = notebooks.filter((n) => n.status === s).length;
              const cfg = STATUS_CONFIG[s];
              return count > 0 ? (
                <span key={s} className="flex items-center gap-1">
                  <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                  {count} {s}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotebookTable;
