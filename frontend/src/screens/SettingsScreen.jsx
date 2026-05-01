import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Shield, Palette, Cpu, Key, Globe, Moon, Sun,
  Save, Check, Eye, EyeOff, AlertTriangle, Zap, RefreshCw, Trash2
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

const tabs = [
  { id: 'profile',      label: 'Profile',       icon: User },
  { id: 'appearance',   label: 'Appearance',     icon: Palette },
  { id: 'notifications',label: 'Notifications',  icon: Bell },
  { id: 'resources',    label: 'Resources',      icon: Cpu },
  { id: 'security',     label: 'Security',       icon: Shield },
];

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${value ? 'bg-indigo-500' : 'bg-slate-700'}`}
  >
    <motion.span
      animate={{ x: value ? 20 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
    />
  </button>
);

const Section = ({ title, children }) => (
  <div className="space-y-1">
    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">{title}</p>
    <div className="bg-slate-800/60 border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.05]">
      {children}
    </div>
  </div>
);

const Row = ({ label, description, children }) => (
  <div className="flex items-center justify-between px-5 py-4 gap-4">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-slate-200">{label}</p>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────
const ProfileTab = ({ user }) => {
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '', bio: '' });
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/20 border border-white/10">
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#09090b]" />
        </div>
        <div>
          <p className="font-bold text-white text-lg">{user?.username}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <span className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${user?.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
            {user?.role === 'admin' ? '⚡ Admin' : '👤 User'}
          </span>
        </div>
      </div>

      <Section title="Account Info">
        <div className="px-5 py-4 space-y-4">
          {[
            { label: 'Username', key: 'username', type: 'text', placeholder: 'your_username' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Bio', key: 'bio', type: 'text', placeholder: 'ML Engineer | Building cool things' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full mt-1.5 px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
          ))}
        </div>
      </Section>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={save}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}`}>
        {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
      </motion.button>
    </div>
  );
};

// ─────────────────────────────────────────────────────
const AppearanceTab = () => {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('indigo');
  const [fontSize, setFontSize] = useState('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactSidebar, setCompactSidebar] = useState(false);

  const accents = [
    { id: 'indigo', color: 'bg-indigo-500' },
    { id: 'violet', color: 'bg-violet-500' },
    { id: 'blue',   color: 'bg-blue-500' },
    { id: 'emerald',color: 'bg-emerald-500' },
    { id: 'rose',   color: 'bg-rose-500' },
    { id: 'amber',  color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <Section title="Theme">
        <Row label="Color Scheme" description="Choose your preferred interface theme">
          <div className="flex gap-2">
            {[{id:'dark', icon: Moon}, {id:'light', icon: Sun}, {id:'system', icon: RefreshCw}].map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${theme === t.id ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'}`}>
                <t.icon size={14} />
                <span className="capitalize">{t.id}</span>
              </button>
            ))}
          </div>
        </Row>
        <Row label="Accent Color" description="Highlights, buttons, and active states">
          <div className="flex gap-2">
            {accents.map(a => (
              <button key={a.id} onClick={() => setAccentColor(a.id)}
                className={`w-7 h-7 rounded-full ${a.color} transition-all border-2 ${accentColor === a.id ? 'border-white scale-110' : 'border-transparent'}`} />
            ))}
          </div>
        </Row>
      </Section>

      <Section title="Typography & Layout">
        <Row label="Font Size" description="Editor and UI text size">
          <div className="flex gap-1 bg-slate-900 rounded-xl p-1 border border-white/10">
            {['small','medium','large'].map(s => (
              <button key={s} onClick={() => setFontSize(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${fontSize === s ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Reduced Motion" description="Disable animations for accessibility">
          <Toggle value={reducedMotion} onChange={setReducedMotion} />
        </Row>
        <Row label="Compact Sidebar" description="Smaller sidebar items for more screen space">
          <Toggle value={compactSidebar} onChange={setCompactSidebar} />
        </Row>
      </Section>
    </div>
  );
};

// ─────────────────────────────────────────────────────
const NotificationsTab = () => {
  const [prefs, setPrefs] = useState({
    notebookReady: true,
    notebookStopped: true,
    idleWarning: true,
    systemAlerts: true,
    weeklyDigest: false,
    emailNotifs: false,
    browserPush: true,
  });
  const toggle = key => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6">
      <Section title="Notebook Events">
        <Row label="Notebook Ready" description="When your notebook finishes provisioning"><Toggle value={prefs.notebookReady} onChange={() => toggle('notebookReady')} /></Row>
        <Row label="Notebook Stopped" description="When a notebook is stopped or terminated"><Toggle value={prefs.notebookStopped} onChange={() => toggle('notebookStopped')} /></Row>
        <Row label="Idle Warning" description="Alert before auto-shutdown due to inactivity"><Toggle value={prefs.idleWarning} onChange={() => toggle('idleWarning')} /></Row>
      </Section>
      <Section title="Platform">
        <Row label="System Alerts" description="Critical cluster or resource warnings"><Toggle value={prefs.systemAlerts} onChange={() => toggle('systemAlerts')} /></Row>
        <Row label="Weekly Digest" description="Summary of your usage every Monday"><Toggle value={prefs.weeklyDigest} onChange={() => toggle('weeklyDigest')} /></Row>
      </Section>
      <Section title="Delivery">
        <Row label="Email Notifications" description="Receive alerts to your registered email"><Toggle value={prefs.emailNotifs} onChange={() => toggle('emailNotifs')} /></Row>
        <Row label="Browser Push" description="In-browser toast notifications"><Toggle value={prefs.browserPush} onChange={() => toggle('browserPush')} /></Row>
      </Section>
    </div>
  );
};

// ─────────────────────────────────────────────────────
const ResourcesTab = () => {
  const [autoShutdown, setAutoShutdown] = useState(true);
  const [shutdownTimeout, setShutdownTimeout] = useState(30);
  const [defaultCpu, setDefaultCpu] = useState('500m');
  const [defaultRam, setDefaultRam] = useState('1Gi');
  const [defaultGpu, setDefaultGpu] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <Section title="Auto-Shutdown">
        <Row label="Enable Auto-Shutdown" description="Automatically stop idle notebooks to save resources">
          <Toggle value={autoShutdown} onChange={setAutoShutdown} />
        </Row>
        <Row label="Idle Timeout" description="Minutes of inactivity before shutdown">
          <div className="flex items-center gap-3">
            <input type="range" min="10" max="120" step="5" value={shutdownTimeout}
              onChange={e => setShutdownTimeout(Number(e.target.value))}
              className="w-28 accent-indigo-500" />
            <span className="text-sm font-bold text-indigo-400 w-16 text-right">{shutdownTimeout} min</span>
          </div>
        </Row>
      </Section>

      <Section title="Default Notebook Resources">
        <Row label="CPU Request" description="Default CPU for new notebooks">
          <select value={defaultCpu} onChange={e => setDefaultCpu(e.target.value)}
            className="bg-slate-900 border border-white/10 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            {['250m','500m','1000m','2000m'].map(v => <option key={v}>{v}</option>)}
          </select>
        </Row>
        <Row label="Memory Request" description="Default RAM for new notebooks">
          <select value={defaultRam} onChange={e => setDefaultRam(e.target.value)}
            className="bg-slate-900 border border-white/10 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            {['512Mi','1Gi','2Gi','4Gi','8Gi'].map(v => <option key={v}>{v}</option>)}
          </select>
        </Row>
        <Row label="GPU Enabled by Default" description="Attach GPU to every new notebook">
          <Toggle value={defaultGpu} onChange={setDefaultGpu} />
        </Row>
      </Section>

      {/* Resource quota display */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-5">
        <p className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2"><Zap size={14} className="text-indigo-400" /> Your Quota</p>
        <div className="space-y-3">
          {[
            { label: 'CPU', used: 1, total: 8, unit: 'cores', color: 'indigo' },
            { label: 'RAM', used: 3, total: 16, unit: 'GB', color: 'violet' },
            { label: 'Storage', used: 12, total: 50, unit: 'GB', color: 'blue' },
          ].map(q => (
            <div key={q.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">{q.label}</span>
                <span className="text-slate-300 font-bold">{q.used} / {q.total} {q.unit}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full bg-${q.color}-500 rounded-full`} style={{ width: `${(q.used/q.total)*100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}`}>
        {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Defaults</>}
      </motion.button>
    </div>
  );
};

// ─────────────────────────────────────────────────────
const SecurityTab = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('24h');
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [saved, setSaved] = useState(false);

  const strength = pwd.newPwd.length === 0 ? 0 : pwd.newPwd.length < 6 ? 1 : pwd.newPwd.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];

  return (
    <div className="space-y-6">
      <Section title="Change Password">
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Password</label>
            <div className="relative mt-1.5">
              <input type={showCurrent ? 'text' : 'password'} value={pwd.current}
                onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
                className="w-full px-4 py-2.5 pr-10 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="••••••••" />
              <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">New Password</label>
            <div className="relative mt-1.5">
              <input type={showNew ? 'text' : 'password'} value={pwd.newPwd}
                onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))}
                className="w-full px-4 py-2.5 pr-10 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Min. 8 characters" />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {pwd.newPwd && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-1 flex-1">
                  {[1,2,3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-slate-700'}`} />
                  ))}
                </div>
                <span className={`text-xs font-bold ${strength === 1 ? 'text-red-400' : strength === 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confirm New Password</label>
            <input type="password" value={pwd.confirm}
              onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
              className="w-full mt-1.5 px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="••••••••" />
            {pwd.confirm && pwd.newPwd !== pwd.confirm && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle size={11} /> Passwords do not match</p>
            )}
          </div>
        </div>
      </Section>

      <Section title="Access & Sessions">
        <Row label="Two-Factor Authentication" description="Require a second verification step on login">
          <Toggle value={twoFA} onChange={setTwoFA} />
        </Row>
        <Row label="Session Timeout" description="Auto-logout after period of inactivity">
          <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}
            className="bg-slate-900 border border-white/10 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            {['1h','4h','8h','24h','7d'].map(v => <option key={v}>{v}</option>)}
          </select>
        </Row>
        <Row label="Active Sessions" description="1 session active now (this browser)">
          <button className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10">
            Revoke All
          </button>
        </Row>
      </Section>

      <Section title="Danger Zone">
        <Row label="Delete Account" description="Permanently delete your account and all data">
          <button className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-all">
            <Trash2 size={12} /> Delete Account
          </button>
        </Row>
      </Section>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}`}>
        {saved ? <><Check size={15} /> Saved!</> : <><Key size={15} /> Update Password</>}
      </motion.button>
    </div>
  );
};

// ─── Main Settings Screen ─────────────────────────────
const SettingsScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabContent = {
    profile:       <ProfileTab user={user} />,
    appearance:    <AppearanceTab />,
    notifications: <NotificationsTab />,
    resources:     <ResourcesTab />,
    security:      <SecurityTab />,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account, preferences, and platform settings.</p>
      </div>

      <div className="flex gap-6">
        {/* Tab Sidebar */}
        <div className="flex-shrink-0 w-52 space-y-1">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? 'text-white' : 'text-slate-400'} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#0f1117] rounded-2xl border border-white/[0.07] p-6 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
