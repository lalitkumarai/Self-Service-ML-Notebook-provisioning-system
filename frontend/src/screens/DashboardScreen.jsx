import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import CreateNotebookModal from '../components/CreateNotebookModal';
import Toast from '../components/Toast';
import PageTransition from '../components/PageTransition';
import StatsGrid from '../components/ui/StatsGrid';
import ResourceUsageChart from '../components/ui/ResourceUsageChart';
import NotebookTable from '../components/ui/NotebookTable';
import RecentActivity from '../components/ui/RecentActivity';
import ResourceQuotaPanel from '../components/ui/ResourceQuotaPanel';
import {
  Plus,
  RefreshCw,
  Trash2,
  Play,
  Server,
  HardDrive,
  Cpu,
  Database,
  Zap,
  Clock,
  RotateCcw,
  TrendingUp,
  Activity,
  BarChart2,
  BookOpen,
  ChevronRight,
  Terminal,
  ExternalLink,
  Square,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ─── Mock activity data ───────────────────────────────────────────────────────
const ACTIVITY_DATA = [
  { time: '6h ago', notebooks: 1 },
  { time: '5h ago', notebooks: 2 },
  { time: '4h ago', notebooks: 2 },
  { time: '3h ago', notebooks: 3 },
  { time: '2h ago', notebooks: 4 },
  { time: '1h ago', notebooks: 3 },
  { time: 'Now', notebooks: 4 },
];

const RESOURCE_DATA = [
  { time: '10:00', cpu: 15, ram: 30 },
  { time: '10:30', cpu: 28, ram: 38 },
  { time: '11:00', cpu: 45, ram: 42 },
  { time: '11:30', cpu: 60, ram: 55 },
  { time: '12:00', cpu: 52, ram: 58 },
  { time: '12:30', cpu: 70, ram: 65 },
  { time: '13:00', cpu: 48, ram: 52 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const variants = {
    Running: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    Creating: 'bg-blue-50 text-blue-700 border border-blue-200',
    Stopped: 'bg-slate-100 text-slate-600 border border-slate-200',
    Failed: 'bg-red-50 text-red-700 border border-red-200',
  };
  const dots = {
    Running: 'bg-emerald-500',
    Pending: 'bg-amber-500',
    Creating: 'bg-blue-500',
    Stopped: 'bg-slate-400',
    Failed: 'bg-red-500',
  };
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', variants[status] || variants.Stopped)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', dots[status] || dots.Stopped, status === 'Running' && 'animate-pulse')} />
      {status}
    </span>
  );
};

const NotebookCard = ({ notebook, onConnect, onStop, onDelete, index }) => {
  const isRunning = notebook.status === 'Running';
  const isStopped = notebook.status === 'Stopped';
  const [stopping, setStopping] = useState(false);

  const handleStop = async () => {
    setStopping(true);
    await onStop(notebook._id);
    setStopping(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      layout
    >
      <div className="group bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-lg hover:border-indigo-200/60 transition-all duration-300 overflow-hidden flex flex-col h-full">
        {/* Card top accent */}
        <div className={clsx('h-1 w-full', isRunning ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : isStopped ? 'bg-gradient-to-r from-orange-300 to-amber-400' : 'bg-gradient-to-r from-slate-200 to-slate-300')} />

        <div className="p-5 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-700 transition-colors" title={notebook.name}>
                {notebook.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                #{notebook._id.substring(0, 8)}
              </p>
            </div>
            <StatusBadge status={notebook.status} />
          </div>

          {/* Resource grid */}
          <div className="grid grid-cols-2 gap-2.5 flex-1">
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Cpu size={13} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">CPU</p>
                <p className="text-xs font-bold text-slate-700">{notebook.cpu}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Database size={13} className="text-violet-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">RAM</p>
                <p className="text-xs font-bold text-slate-700">{notebook.memory}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <HardDrive size={13} className="text-slate-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Disk</p>
                <p className="text-xs font-bold text-slate-700">{notebook.storage || '1Gi'}</p>
              </div>
            </div>
            <div className={clsx(
              'flex items-center gap-2 p-2.5 rounded-xl border',
              notebook.gpu
                ? 'bg-amber-50 border-amber-200'
                : 'bg-slate-50 border-slate-100'
            )}>
              <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', notebook.gpu ? 'bg-amber-100' : 'bg-slate-100')}>
                <Zap size={13} className={notebook.gpu ? 'text-amber-600' : 'text-slate-400'} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">GPU</p>
                <p className={clsx('text-xs font-bold', notebook.gpu ? 'text-amber-700' : 'text-slate-500')}>
                  {notebook.gpu ? 'Enabled' : 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* Created date */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-400 gap-1.5">
            <Clock size={12} />
            <span>Created {new Date(notebook.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* ── Action footer: Open | Stop | Delete ── */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
          {/* Open / Reconnect */}
          <button
            onClick={() => onConnect(notebook._id)}
            className={clsx(
              'flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all',
              isRunning
                ? 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
            )}
          >
            {isRunning ? <ExternalLink size={12} /> : <RotateCcw size={12} />}
            {isRunning ? 'Open' : 'Start'}
          </button>

          {/* Stop — only shown/active when Running */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleStop}
            disabled={!isRunning || stopping}
            className={clsx(
              'flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all',
              isRunning && !stopping
                ? 'text-orange-500 hover:bg-orange-50 hover:text-orange-600'
                : 'text-slate-300 cursor-not-allowed'
            )}
          >
            {stopping ? (
              <span className="w-3 h-3 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
            ) : (
              <Square size={11} className={isRunning ? 'fill-orange-400' : 'fill-slate-200'} />
            )}
            {stopping ? '...' : 'Stop'}
          </motion.button>

          {/* Delete */}
          <button
            onClick={() => onDelete(notebook._id)}
            className="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const QuotaBar = ({ label, used, total, icon: Icon, color }) => {
  const pct = Math.min((used / total) * 100, 100);
  const isOver = used > total;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Icon size={14} className="text-slate-400" />
          <span className="font-medium">{label}</span>
        </div>
        <span className={clsx('text-sm font-bold', isOver ? 'text-red-600' : 'text-slate-800')}>
          {used.toFixed(1)} <span className="font-normal text-slate-400">/ {total}</span>
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className={clsx('h-full rounded-full', isOver ? 'bg-red-500' : color)}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1 text-right">{pct.toFixed(0)}% used</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DashboardScreen = () => {
  const [notebooks, setNotebooks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, running: 0, pending: 0, storage: '0GB', cpuUsed: 0, ramUsed: 0 });

  const QUOTA = { cpu: 4, ram: 16 };
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const running = notebooks.filter(n => n.status === 'Running').length;
    const pending = notebooks.filter(n => n.status === 'Pending' || n.status === 'Creating').length;
    let totalStorage = 0, totalCpu = 0, totalRam = 0;
    notebooks.forEach(n => {
      const storeVal = parseInt(n.storage || '0');
      if (!isNaN(storeVal)) totalStorage += storeVal;
      if (n.cpu) {
        const val = n.cpu.toString().endsWith('m') ? parseInt(n.cpu) / 1000 : parseFloat(n.cpu);
        if (!isNaN(val)) totalCpu += val;
      }
      if (n.memory) {
        let val = 0;
        if (n.memory.toString().endsWith('Gi')) val = parseInt(n.memory);
        else if (n.memory.toString().endsWith('Mi')) val = parseInt(n.memory) / 1024;
        else val = parseFloat(n.memory);
        if (!isNaN(val)) totalRam += val;
      }
    });
    setStats({ total: notebooks.length, running, pending, storage: `${totalStorage}GB`, cpuUsed: totalCpu, ramUsed: totalRam });
  }, [notebooks]);

  const fetchNotebooks = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const { data } = await axios.get('/api/notebook/list');
      setNotebooks(data);
    } catch (err) {
      if (!err.response) {
        setNotebooks([
          { _id: '65abc001de', name: 'Deep Learning Lab', status: 'Running', cpu: '2000m', memory: '8Gi', gpu: true, storage: '10Gi', createdAt: new Date().toISOString() },
          { _id: '65abc002df', name: 'NLP Research', status: 'Pending', cpu: '1000m', memory: '4Gi', gpu: false, storage: '5Gi', createdAt: new Date(Date.now() - 3600000).toISOString() },
          { _id: '65abc003dg', name: 'Data Analysis', status: 'Stopped', cpu: '500m', memory: '2Gi', gpu: false, storage: '2Gi', createdAt: new Date(Date.now() - 86400000).toISOString() },
        ]);
      }
    } finally {
      if (!silent) setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotebooks();
    const id = setInterval(() => fetchNotebooks(true), 10000);
    return () => clearInterval(id);
  }, [user]);

  const showToast = (msg, type = 'success') => setToast({ show: true, message: msg, type });

  const deleteHandler = async (id) => {
    if (!window.confirm('Delete this notebook? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/notebook/delete/${id}`);
      fetchNotebooks(true);
      showToast('Notebook deleted successfully');
    } catch {
      showToast('Failed to delete notebook', 'error');
    }
  };

  const stopHandler = async (id) => {
    try {
      await axios.post(`/api/notebook/stop/${id}`);
      fetchNotebooks(true);
      showToast('Notebook stopped. Your data is preserved.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to stop notebook', 'error');
    }
  };

  const connectHandler = async (id) => {
    try {
      await axios.post(`/api/notebook/reconnect/${id}`);
      navigate(`/notebook/${id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to connect', 'error');
    }
  };

  const PIE_DATA = [
    { name: 'Running', value: stats.running, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Stopped', value: Math.max(0, stats.total - stats.running - stats.pending), color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <PageTransition>

      {/* ── Hero page header ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl mb-6"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute -bottom-16 left-1/3 w-60 h-60 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        <div className="relative px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: greeting */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {/* Live cluster health pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                <span className="text-[11px] font-bold text-emerald-400 tracking-wide">Cluster Healthy</span>
              </div>
              <span className="hidden sm:inline text-[11px] text-slate-500 font-medium px-2 py-0.5 bg-white/5 rounded-lg border border-white/10">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
              <span className="text-slate-300">Welcome back, </span>
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #818cf8, #c084fc)' }}
              >
                {user?.username || 'User'}
              </span>
              <span className="ml-2 text-xl">👋</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Your GPU-accelerated notebooks are ready. Let's build something great.
            </p>
          </div>

          {/* Right: action buttons + version badges */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchNotebooks()}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-white/10 bg-white/8 text-slate-300 hover:bg-white/14 hover:text-white transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw size={13} className={clsx(isRefreshing && 'animate-spin')} />
                Refresh
              </button>
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 14px rgb(99 102 241 / 0.45)',
                }}
              >
                <Plus size={14} />
                Create Notebook
              </button>
            </div>
            {/* Tech stack badges */}
            <div className="flex items-center gap-1.5 justify-end">
              {['K8s v1.28', 'Jupyter v4.0', 'CUDA 12.3'].map(badge => (
                <span key={badge} className="text-[10px] font-mono text-slate-600 bg-white/5 border border-white/8 px-2 py-0.5 rounded-md">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats strip */}
        <div className="border-t border-white/[0.07] px-6 py-2.5 flex items-center gap-6 flex-wrap">
          {[
            { label: 'Region', value: 'us-central1', icon: Server },
            { label: 'Zone', value: 'us-central1-a', icon: Activity },
            { label: 'Nodes', value: '3 Ready', icon: Zap },
            { label: 'API Latency', value: '12ms', icon: BarChart2, valueClass: 'text-emerald-400' },
          ].map(({ label, value, icon: Icon, valueClass }) => (
            <div key={label} className="flex items-center gap-1.5 text-[11px]">
              <Icon size={11} className="text-slate-600" />
              <span className="text-slate-500">{label}:</span>
              <span className={clsx('font-semibold text-slate-300', valueClass)}>{value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Stats row ────────────────────────────────────────────────── */}
      <div className="mb-7">
        <StatsGrid stats={stats} />
      </div>

      {/* ── Quota + Resource Chart row ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7">
        {/* Premium quota panel */}
        <ResourceQuotaPanel
          cpuUsed={stats.cpuUsed}
          ramUsed={stats.ramUsed}
          storageUsed={parseInt(stats.storage) || 0}
        />

        {/* Resource Usage Chart */}
        <div className="lg:col-span-2">
          <ResourceUsageChart />
        </div>
      </div>

      {/* ── Notebooks + Activity row ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Notebook table — takes 2/3 width on large screens */}
        <div className="xl:col-span-2">
          <NotebookTable
            notebooks={notebooks}
            isLoading={isLoading}
            onOpen={(id) => connectHandler(id)}
            onReconnect={(id) => connectHandler(id)}
            onStop={(id) => stopHandler(id)}
            onDelete={(id) => deleteHandler(id)}
            onCreateNew={() => setIsOpen(true)}
          />
        </div>

        {/* Recent activity — 1/3 width sidebar */}
        <div>
          <RecentActivity notebooks={notebooks} />
        </div>
      </div>

      {/* Modals */}
      <CreateNotebookModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSuccess={() => { fetchNotebooks(); showToast('Notebook created!'); }} />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, show: false }))} />
    </PageTransition>
  );
};

export default DashboardScreen;
