import { Fragment, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  LayoutDashboard,
  Plus,
  FolderOpen,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Activity,
  Settings,
  HelpCircle,
  User,
  Zap,
  ChevronRight,
  Sparkles,
  Command,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Navigation config ────────────────────────────────────────────────────────
const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & metrics',
  },
  {
    name: 'Create Notebook',
    href: '/dashboard?create=true',
    icon: Plus,
    description: 'New environment',
    highlight: true,
  },
  {
    name: 'My Notebooks',
    href: '/dashboard',
    icon: FolderOpen,
    description: 'Manage notebooks',
  },
  {
    name: 'Admin Console',
    href: '/admin',
    icon: Shield,
    description: 'User & system mgmt',
    adminOnly: true,
  },
];

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
const NavItem = ({ item, isActive, onClick }) => (
  <Link
    to={item.href}
    onClick={onClick}
    className={clsx(
      'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
        : item.highlight
        ? 'text-indigo-300 hover:bg-indigo-600/15 hover:text-indigo-200 border border-dashed border-indigo-700/50 hover:border-indigo-600/60'
        : 'text-slate-400 hover:bg-white/6 hover:text-slate-100'
    )}
  >
    {/* Active indicator bar */}
    {isActive && (
      <motion.div
        layoutId="nav-active"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-full"
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
    )}

    <item.icon
      size={17}
      className={clsx(
        'flex-shrink-0 transition-colors duration-200',
        isActive
          ? 'text-white'
          : item.highlight
          ? 'text-indigo-400'
          : 'text-slate-500 group-hover:text-slate-300'
      )}
    />

    <div className="min-w-0 flex-1">
      <p className="truncate leading-tight font-medium">{item.name}</p>
      {!isActive && (
        <p
          className={clsx(
            'text-[10px] truncate mt-0.5 transition-colors',
            item.highlight
              ? 'text-indigo-600 group-hover:text-indigo-400'
              : 'text-slate-600 group-hover:text-slate-500'
          )}
        >
          {item.description}
        </p>
      )}
    </div>

    {item.highlight && !isActive && (
      <span className="ml-auto flex-shrink-0 text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md font-bold border border-indigo-500/30 uppercase tracking-wider">
        New
      </span>
    )}

    {isActive && (
      <ChevronRight size={13} className="ml-auto text-white/60 flex-shrink-0" />
    )}
  </Link>
);

// ─── Sidebar content component ────────────────────────────────────────────────
const SidebarContent = ({ location, onNavigate, user, onLogout }) => (
  <div className="flex flex-col h-full">
    {/* ── Logo ── */}
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/50 flex-shrink-0">
        <Zap className="w-4.5 h-4.5 text-white" size={18} />
        {/* Subtle shine */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      </div>
      <div className="min-w-0">
        <p className="text-[15px] font-bold text-white tracking-tight leading-none">ML Notebooks</p>
        <p className="text-[10px] text-indigo-400/80 font-semibold uppercase tracking-[0.15em] mt-0.5">
          Platform
        </p>
      </div>
    </div>

    {/* Divider */}
    <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent mb-4" />

    {/* ── Navigation label ── */}
    <div className="px-5 mb-2">
      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.18em]">Navigation</p>
    </div>

    {/* ── Nav items ── */}
    <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4 scrollbar-thin">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href.split('?')[0];
        return (
          <NavItem
            key={item.name}
            item={item}
            isActive={isActive}
            onClick={onNavigate}
          />
        );
      })}

      {/* Workspace section */}
      <div className="pt-4 pb-2">
        <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.18em]">
          Workspace
        </p>
      </div>
      <button className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-white/6 hover:text-slate-200 transition-all duration-200">
        <HelpCircle size={17} className="text-slate-600 group-hover:text-slate-300 flex-shrink-0" />
        <span>Help & Support</span>
      </button>
      <button className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-white/6 hover:text-slate-200 transition-all duration-200">
        <Settings size={17} className="text-slate-600 group-hover:text-slate-300 flex-shrink-0" />
        <span>Settings</span>
      </button>
    </nav>

    {/* ── User profile card ── */}
    <div className="p-3 border-t border-slate-800/50">
      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-colors duration-200 group">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
              {user?.username?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                'U'}
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate leading-tight">
              {user?.username || 'User'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>

          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 flex-shrink-0 opacity-0 group-hover:opacity-100"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Layout ──────────────────────────────────────────────────────────────
const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/admin') return 'Admin Console';
    if (path.startsWith('/notebook/')) return 'Notebook Editor';
    return 'ML Platform';
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/dashboard') return [{ label: 'ML Platform', href: '/' }, { label: 'Dashboard' }];
    if (path === '/admin') return [{ label: 'ML Platform', href: '/' }, { label: 'Admin Console' }];
    return [{ label: 'ML Platform' }];
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Mobile Sidebar ───────────────────────────────────────────── */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex flex-col w-72 bg-[#0f1629] shadow-2xl">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>
                <SidebarContent
                  location={location}
                  onNavigate={() => setSidebarOpen(false)}
                  user={user}
                  onLogout={handleLogout}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div
          className="w-[220px] xl:w-60 flex flex-col border-r border-slate-800/40"
          style={{
            background: 'linear-gradient(180deg, #0d1526 0%, #111827 60%, #0f1629 100%)',
          }}
        >
          <SidebarContent
            location={location}
            onNavigate={() => {}}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* ── Main content area ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Top Navbar ───────────────────────────────────────────── */}
        <header className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-slate-200/70 z-10">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">

            {/* Left: mobile menu + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={19} />
              </button>

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm">
                {breadcrumb.map((crumb, i) => (
                  <Fragment key={i}>
                    {i > 0 && <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />}
                    {crumb.href ? (
                      <Link
                        to={crumb.href}
                        className="text-slate-400 hover:text-slate-700 transition-colors hidden sm:inline font-medium"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-900">{crumb.label}</span>
                    )}
                  </Fragment>
                ))}
              </nav>
            </div>

            {/* Right: actions bar */}
            <div className="flex items-center gap-1.5">

              {/* System healthy badge */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                System Healthy
              </div>

              {/* Command search hint — premium touch */}
              <button className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-400 font-medium transition-all group">
                <Command size={12} className="text-slate-400" />
                <span>Search</span>
                <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-1 py-0.5 rounded font-bold">⌘K</span>
              </button>

              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  <Bell size={17} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      onMouseLeave={() => setNotifOpen(false)}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">Notifications</p>
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          2 new
                        </span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {[
                          { icon: '🟢', title: 'Cluster status nominal', time: '2m ago', unread: true },
                          { icon: '📦', title: 'NLP Research notebook ready', time: '15m ago', unread: true },
                          { icon: '⚡', title: 'GPU quota renewed', time: '1h ago', unread: false },
                        ].map((n, i) => (
                          <div
                            key={i}
                            className={clsx('flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer', n.unread && 'bg-indigo-50/30')}
                          >
                            <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-800 font-medium">{n.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                            </div>
                            {n.unread && <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />}
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
                        <button className="w-full text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                          View all notifications →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Vertical divider */}
              <div className="w-px h-5 bg-slate-200 mx-0.5" />

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group"
                >
                  <div className="relative w-7 h-7 flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                    {user?.username || user?.email}
                  </span>
                  <ChevronDown
                    size={13}
                    className={clsx(
                      'text-slate-400 transition-transform duration-200 flex-shrink-0',
                      userMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      {/* Profile header */}
                      <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/30 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.username}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                        {user?.role === 'admin' && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-indigo-200">
                              <Sparkles size={9} />
                              Admin
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Menu items */}
                      <div className="p-2">
                        {[
                          { icon: User, label: 'Profile Settings' },
                          { icon: Activity, label: 'Activity Log' },
                          { icon: Settings, label: 'Preferences' },
                        ].map(({ icon: Icon, label }) => (
                          <button
                            key={label}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-100 transition-all font-medium"
                          >
                            <Icon size={14} className="text-slate-400" />
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="p-2 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all font-semibold"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <div className="p-5 sm:p-7 max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
