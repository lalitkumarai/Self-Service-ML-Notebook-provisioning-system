import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/AuthProvider';
import {
  Users,
  Server,
  Activity,
  Cpu,
  Database,
  Trash2,
  Shield,
  Eye,
  RefreshCw,
  TrendingUp,
  Zap,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  Terminal,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { clsx } from 'clsx';

// ─── Mock data ────────────────────────────────────────────────────────────────
const RESOURCE_DATA = [
  { time: '10:00', cpu: 20, ram: 35 },
  { time: '10:15', cpu: 25, ram: 38 },
  { time: '10:30', cpu: 45, ram: 42 },
  { time: '10:45', cpu: 60, ram: 55 },
  { time: '11:00', cpu: 55, ram: 52 },
  { time: '11:15', cpu: 70, ram: 65 },
  { time: '11:30', cpu: 85, ram: 70 },
  { time: '11:45', cpu: 65, ram: 60 },
  { time: '12:00', cpu: 50, ram: 55 },
];

const POD_STATUS_DATA = [
  { name: 'Running', count: 0, color: '#10b981' },
  { name: 'Pending', count: 0, color: '#f59e0b' },
  { name: 'Failed', count: 0, color: '#ef4444' },
];

const containerAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const AdminStatCard = ({ label, value, icon: Icon, gradient, subtext, index }) => (
  <motion.div variants={itemAnim}>
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className={clsx('h-1', gradient)} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', gradient.replace('bg-gradient-to-r', 'bg-gradient-to-br'))}>
            <Icon size={17} className="text-white" />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  </motion.div>
);

const StatusPill = ({ status }) => {
  const map = {
    Running: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500' },
    Pending: { bg: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-500' },
    Failed: { bg: 'bg-red-50 border-red-200 text-red-700', dot: 'bg-red-500' },
    Stopped: { bg: 'bg-slate-100 border-slate-200 text-slate-600', dot: 'bg-slate-400' },
  };
  const s = map[status] || map.Stopped;
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border', s.bg)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', s.dot, status === 'Running' && 'animate-pulse')} />
      {status}
    </span>
  );
};

const RoleBadge = ({ role }) => (
  <span className={clsx(
    'text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide',
    role === 'admin'
      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
      : 'bg-slate-100 text-slate-600 border border-slate-200'
  )}>
    {role}
  </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [systemStatus, setSystemStatus] = useState({ status: 'Checking...', k8sVersion: '-', cluster: 'Unknown' });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  const { user } = useAuth();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      const [usersRes, notebooksRes, systemRes] = await Promise.all([
        axios.get('/auth/users'),
        axios.get('/api/notebook/list'),
        axios.get('/api/notebook/system-status'),
      ]);
      setUsers(usersRes.data);
      setNotebooks(notebooksRes.data);
      setSystemStatus(systemRes.data);
    } catch {
      // Graceful fallback
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
      const id = setInterval(() => fetchData(true), 15000);
      return () => clearInterval(id);
    }
  }, [user]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await axios.delete(`/auth/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      showToast('User deleted successfully');
    } catch {
      showToast('Failed to delete user', 'error');
    }
  };

  const handleDeleteNotebook = async (id) => {
    if (!window.confirm('Terminate this notebook?')) return;
    try {
      await axios.delete(`/api/notebook/delete/${id}`);
      setNotebooks(prev => prev.filter(n => n._id !== id));
      showToast('Notebook terminated');
    } catch {
      showToast('Failed to terminate notebook', 'error');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredNotebooks = notebooks.filter(nb =>
    nb.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Build live pod status data
  const podStatusData = [
    { name: 'Running', count: notebooks.filter(n => n.status === 'Running').length, color: '#10b981' },
    { name: 'Pending', count: notebooks.filter(n => n.status === 'Pending').length, color: '#f59e0b' },
    { name: 'Stopped', count: notebooks.filter(n => n.status === 'Stopped').length, color: '#94a3b8' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center animate-pulse">
          <Shield size={26} className="text-indigo-400" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading admin console...</p>
      </div>
    );
  }

  return (
    <PageTransition>
      {/* Toast */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className={clsx(
            'fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border',
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {toast.message}
        </motion.div>
      )}

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Shield size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Console</h1>
          </div>
          <p className="text-sm text-slate-500 ml-11">Manage users, notebooks, and monitor cluster health</p>
        </div>
        <div className="flex items-center gap-3">
          {/* System health badge */}
          <div className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold',
            systemStatus.status === 'Healthy'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          )}>
            <span className={clsx('w-2 h-2 rounded-full animate-pulse', systemStatus.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500')} />
            {systemStatus.status}
            {systemStatus.cluster !== 'Unknown' && <span className="ml-1 text-slate-400">· {systemStatus.cluster}</span>}
          </div>
          <button
            onClick={() => fetchData()}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition-all disabled:opacity-60"
          >
            <RefreshCw size={14} className={clsx(isRefreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <motion.div
        variants={containerAnim}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7"
      >
        <AdminStatCard index={0} label="Total Users" value={users.length} subtext="Registered accounts" icon={Users} gradient="bg-gradient-to-r from-indigo-500 to-indigo-600" />
        <AdminStatCard index={1} label="Active Notebooks" value={notebooks.filter(n => n.status === 'Running').length} subtext={`of ${notebooks.length} total`} icon={Server} gradient="bg-gradient-to-r from-emerald-500 to-teal-500" />
        <AdminStatCard index={2} label="CPU Utilization" value="42%" subtext="Cluster average" icon={Cpu} gradient="bg-gradient-to-r from-blue-500 to-cyan-500" />
        <AdminStatCard index={3} label="Memory Usage" value="68%" subtext="Cluster average" icon={Database} gradient="bg-gradient-to-r from-violet-500 to-purple-600" />
      </motion.div>

      {/* ── Charts ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-7">
        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Cluster Resource Usage</h2>
              <p className="text-xs text-slate-400 mt-0.5">CPU & RAM over last 2 hours</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />CPU</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" />RAM</span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RESOURCE_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="adminCpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminRamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" unit="%" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 11, boxShadow: '0 4px 20px rgb(0,0,0,0.08)' }} cursor={{ stroke: '#e2e8f0' }} />
                <Area type="monotone" dataKey="cpu" stroke="#6366f1" strokeWidth={2} fill="url(#adminCpuGrad)" name="CPU %" dot={false} />
                <Area type="monotone" dataKey="ram" stroke="#8b5cf6" strokeWidth={2} fill="url(#adminRamGrad)" name="RAM %" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5"
        >
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-800">Pod Status Overview</h2>
            <p className="text-xs text-slate-400 mt-0.5">Current notebook states</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={podStatusData} layout="vertical" margin={{ top: 5, right: 20, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} axisLine={false} stroke="#94a3b8" width={60} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 11 }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={26} name="Notebooks">
                  {podStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Quick summary */}
          <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
            {podStatusData.map(s => (
              <div key={s.name} className="text-center">
                <p className="text-lg font-bold text-slate-800">{s.count}</p>
                <p className="text-[10px] text-slate-400 font-medium">{s.name}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Management tables ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-white rounded-2xl border border-slate-200/70 shadow-sm"
      >
        {/* Table header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['users', 'notebooks'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'px-4 py-2 text-xs font-bold rounded-lg capitalize transition-all',
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {tab === 'users' ? `Users (${users.length})` : `Notebooks (${notebooks.length})`}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        {/* Users table */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">User</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Role</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-sm text-slate-400">
                        <Users size={28} className="mx-auto mb-2 text-slate-300" />
                        No users found
                      </td>
                    </tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {u.username?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{u.username}</p>
                            <p className="text-xs text-slate-400 sm:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-sm text-slate-500">{u.email}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Notebooks table */}
        {activeTab === 'notebooks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Notebook</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Resources</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredNotebooks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-sm text-slate-400">
                        <Terminal size={28} className="mx-auto mb-2 text-slate-300" />
                        No notebooks found
                      </td>
                    </tr>
                  ) : filteredNotebooks.map(nb => (
                    <tr key={nb._id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{nb.name}</p>
                          <p className="text-xs font-mono text-slate-400 mt-0.5">#{nb._id.substring(0, 10)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Cpu size={11} />{nb.cpu}</span>
                          <span className="flex items-center gap-1"><Database size={11} />{nb.memory}</span>
                          {nb.gpu && <span className="flex items-center gap-1 text-amber-600"><Zap size={11} />GPU</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><StatusPill status={nb.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/notebook/${nb._id}`)}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            title="View notebook"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteNotebook(nb._id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Terminate notebook"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Table footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Showing {activeTab === 'users' ? filteredUsers.length : filteredNotebooks.length} of {activeTab === 'users' ? users.length : notebooks.length} {activeTab}
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Clock size={11} /> Auto-refreshes every 15s
          </p>
        </div>
      </motion.div>
    </PageTransition>
  );
};

export default AdminDashboardScreen;
