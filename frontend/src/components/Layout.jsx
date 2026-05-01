import { Fragment, useState, useEffect } from 'react';
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
  Command,
  PanelLeftClose,
  PanelLeftOpen,
  Database,
  FlaskConical,
  PlayCircle
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
  },
  {
    name: 'Create Notebook',
    href: '/dashboard?create=true',
    icon: Plus,
    highlight: true,
  },
  {
    name: 'My Notebooks',
    href: '/dashboard',
    icon: FolderOpen,
  },
  {
    name: 'Datasets',
    href: '/datasets',
    icon: Database,
  },
  {
    name: 'Experiments',
    href: '/experiments',
    icon: FlaskConical,
  },
  {
    name: 'Demo Mode',
    href: '/demo',
    icon: PlayCircle,
  },
  {
    name: 'Admin Console',
    href: '/admin',
    icon: Shield,
    adminOnly: true,
  },
];

// ─── Animations ───────────────────────────────────────────────────────────────
const sidebarVariants = {
  expanded: { width: 260, transition: { type: "spring", stiffness: 300, damping: 30 } },
  collapsed: { width: 80, transition: { type: "spring", stiffness: 300, damping: 30 } }
};

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

// ─── Tooltip Component ────────────────────────────────────────────────────────
const Tooltip = ({ text, show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, x: -10, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-[11px] font-bold tracking-wide uppercase rounded-lg shadow-xl border border-slate-700/50 z-50 whitespace-nowrap pointer-events-none"
      >
        {text}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700/50" />
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
const NavItem = ({ item, isActive, isCollapsed, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div variants={navItemVariants} className="relative z-10 w-full">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Link
          to={item.href}
          onClick={onClick}
          className={clsx(
            'group flex items-center py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden',
            isActive
              ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/5 text-indigo-300 shadow-[0_4px_20px_rgba(99,102,241,0.05)] border border-indigo-500/20'
              : item.highlight
              ? 'bg-white/[0.02] text-indigo-300 hover:bg-white/[0.05] border border-white/[0.05] hover:border-indigo-500/30'
              : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent',
            isCollapsed ? 'justify-center mx-auto w-[52px] h-[52px] px-0' : 'gap-3 px-3 w-full'
          )}
        >
          {/* Active indicator bar */}
          {isActive && (
            <motion.div
              layoutId="nav-active"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.9)] rounded-r-full"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}

          {/* Subtle hover gradient for highlight items */}
          {item.highlight && !isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          )}

          {/* Icon with rotation on hover */}
          <motion.div animate={{ rotate: isHovered ? 6 : 0 }} className="relative z-10 flex items-center justify-center">
            <item.icon
              size={isCollapsed ? 22 : 18}
              strokeWidth={isActive ? 2.5 : 2}
              className={clsx(
                'flex-shrink-0 transition-colors duration-300',
                isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]' : item.highlight ? 'text-indigo-400/80 group-hover:text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'
              )}
            />
          </motion.div>

          {/* Text (hidden if collapsed) */}
          {!isCollapsed && (
            <div className="min-w-0 flex-1 z-10">
              <p className={clsx("truncate tracking-wide", isActive ? "font-bold text-indigo-100" : "font-medium")}>
                {item.name}
              </p>
            </div>
          )}

          {/* 'New' Badge */}
          {!isCollapsed && item.highlight && !isActive && (
            <span className="ml-auto flex-shrink-0 text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider z-10 border border-indigo-500/30">
              New
            </span>
          )}
        </Link>
      </motion.div>

      {/* Tooltip for collapsed state */}
      <Tooltip text={item.name} show={isCollapsed && isHovered} />
    </motion.div>
  );
};

// ─── Desktop & Mobile Sidebar Content ───────────────────────────────────────────
const SidebarContent = ({ location, onNavigate, user, onLogout, isCollapsed, toggleCollapse, isMobile }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={clsx(
        "flex flex-col h-full relative overflow-hidden",
        "bg-[#09090b] text-slate-300" // Premium extremely dark background
      )}
    >
      {/* Premium Glass Background effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-64 bg-indigo-600/10 blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-purple-600/10 blur-[80px] pointer-events-none rounded-full" />

      {/* ── Logo Area ── */}
      <div className={clsx("flex items-center py-6 relative z-20", isCollapsed ? "justify-center px-0" : "px-5 gap-3")}>
        <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 flex-shrink-0 border border-white/10 backdrop-blur-md cursor-pointer">
          <Zap className="w-5 h-5 text-white" fill="currentColor" size={20} />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/30 to-transparent opacity-40 pointer-events-none" />
        </motion.div>
        
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="min-w-0 flex-1">
            <p className="text-[17px] font-extrabold text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">ML Notebooks</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.25em] mt-1 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">Platform</p>
          </motion.div>
        )}
      </div>

      {/* ── Toggle Collapse Button (Desktop Only) ── */}
      {!isMobile && (
        <button 
          onClick={toggleCollapse}
          className={clsx(
            "absolute top-8 z-30 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/50 shadow-sm backdrop-blur-md transition-all",
            isCollapsed ? "right-[-12px] opacity-0 hover:opacity-100" : "right-4 opacity-0 hover:opacity-100 group-hover/sidebar:opacity-100"
          )}
        >
          {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        </button>
      )}

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-6 relative z-10" />

      {/* ── Navigation Items ── */}
      <motion.div variants={staggerContainer} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin px-3 space-y-1 relative z-10">
        {!isCollapsed && <motion.p variants={navItemVariants} className="px-2 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Navigation</motion.p>}
        
        {navigation.map((item) => {
          const isCreate = location.search.includes('create=true');
          const isItemCreate = item.href.includes('create=true');
          const isActive = isItemCreate ? isCreate : (location.pathname === item.href.split('?')[0] && !isCreate);
          
          if (item.adminOnly && user?.role !== 'admin') return null;

          return (
            <NavItem
              key={item.name}
              item={item}
              isActive={isActive}
              isCollapsed={isCollapsed}
              onClick={onNavigate}
            />
          );
        })}

        {/* Workspace section */}
        <div className="pt-6 pb-2">
          {!isCollapsed && <motion.p variants={navItemVariants} className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Workspace</motion.p>}
          <div className="space-y-1">
            <NavItem 
              item={{ name: 'Help & Support', href: '#', icon: HelpCircle }} 
              isActive={false} 
              isCollapsed={isCollapsed} 
              onClick={(e) => e.preventDefault()} 
            />
            <NavItem 
              item={{ name: 'Settings', href: '/settings', icon: Settings }} 
              isActive={location.pathname === '/settings'}
              isCollapsed={isCollapsed} 
              onClick={onNavigate} 
            />
          </div>
        </div>
      </motion.div>

      {/* ── User Profile Card ── */}
      <div className={clsx("p-4 relative z-10 transition-all", isCollapsed && "px-2 pb-6")}>
        <motion.div 
          whileHover={{ scale: isCollapsed ? 1.05 : 1.02 }}
          className={clsx(
            "rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] transition-all duration-300 group/profile cursor-pointer backdrop-blur-xl relative overflow-hidden",
            isCollapsed ? "p-2 mx-auto w-12 h-12 flex items-center justify-center" : "p-3"
          )}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/profile:translate-x-[100%] transition-transform duration-1000" />
          
          <div className="flex items-center gap-3 relative z-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-inner border border-white/10 ring-2 ring-[#09090b]">
                {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[2.5px] border-[#09090b] shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            </div>

            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate leading-tight group-hover/profile:text-white transition-colors">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5 group-hover/profile:text-slate-400 transition-colors">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  title="Sign out"
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 flex-shrink-0 opacity-0 group-hover/profile:opacity-100"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Main Layout ──────────────────────────────────────────────────────────────
const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('sidebarCollapsed', String(newVal));
      return newVal;
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
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
              <Dialog.Panel className="relative flex flex-col w-72 bg-[#09090b] shadow-2xl">
                <div className="absolute top-3 right-3 z-50">
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
                  isCollapsed={false}
                  toggleCollapse={() => {}}
                  isMobile={true}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <motion.div 
        className="hidden lg:flex lg:flex-shrink-0 group/sidebar border-r border-slate-800/60 z-20 shadow-2xl"
        variants={sidebarVariants}
        initial={isCollapsed ? "collapsed" : "expanded"}
        animate={isCollapsed ? "collapsed" : "expanded"}
      >
        <div className="w-full flex flex-col h-full bg-[#09090b]">
          <SidebarContent
            location={location}
            onNavigate={() => {}}
            user={user}
            onLogout={handleLogout}
            isCollapsed={isCollapsed}
            toggleCollapse={toggleCollapse}
            isMobile={false}
          />
        </div>
      </motion.div>

      {/* ── Main content area ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-50 relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">

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
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
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
                              <Shield size={9} />
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
