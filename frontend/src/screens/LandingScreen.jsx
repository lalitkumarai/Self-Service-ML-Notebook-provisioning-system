import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Terminal,
  Cpu,
  Database,
  Server,
  Shield,
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Layers,
  Globe,
  Lock,
  HardDrive,
  BarChart2,
  Sparkles,
  Play,
  Github,
  Twitter,
  Linkedin,
  Menu,
  X,
  Star,
  Clock,
  Users,
  TrendingUp,
  Code,
  BookOpen,
  MonitorPlay,
  Moon,
  Sun,
} from 'lucide-react';

// ─── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.45 } },
};

const stagger = (delay = 0.1) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
});

// ─── useInView wrapper ─────────────────────────────────────────────────────────
const Section = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={stagger(0.08)}
      className={className}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </motion.div>
  );
};

// ─── Floating orb background ────────────────────────────────────────────────
const Orbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
    <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
    <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />
    <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
  </div>
);

// ─── Noise texture overlay ──────────────────────────────────────────────────
const NoiseGrid = ({ opacity = 0.03 }) => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      opacity,
      backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
      backgroundSize: '64px 64px',
    }}
  />
);

// ─── Dark Mode Toggle ────────────────────────────────────────────────────────
const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors overflow-hidden flex items-center justify-center w-10 h-10"
      aria-label="Toggle Dark Mode"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
            className="absolute"
          >
            <Moon size={18} className="fill-indigo-500/20" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
            className="absolute"
          >
            <Sun size={18} className="fill-amber-500/20" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

// ─── Navbar ─────────────────────────────────────────────────────────────────
const Navbar = ({ userInfo }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']);
  const navShadow = useTransform(scrollY, [0, 80], ['0 0 0 0 transparent', '0 1px 24px -4px rgba(0,0,0,0.08)']);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Tech Stack', href: '#tech-stack' },
  ];

  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-50 border-b border-transparent dark:border-slate-800/50"
      style={{ backgroundColor: navBg, boxShadow: navShadow, backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
              <Zap size={18} className="text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <span className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">ML Notebooks</span>
              <span className="hidden sm:block text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest -mt-0.5">
                Platform
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map(({ label, href }) => (
              <motion.a
                key={label}
                href={href}
                className="relative text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors duration-200"
                whileHover="hover"
                initial="initial"
              >
                {label}
                <motion.div 
                  className="absolute left-0 right-0 -bottom-1.5 h-[2.5px] bg-indigo-500 rounded-full origin-left"
                  variants={{
                    initial: { scaleX: 0, opacity: 0 },
                    hover: { scaleX: 1, opacity: 1 }
                  }}
                  transition={{ duration: 0.3, ease: 'backOut' }}
                />
              </motion.a>
            ))}
          </nav>

          {/* Auth actions */}
          <div className="hidden md:flex items-center gap-3">
            <DarkModeToggle />
            {userInfo ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white relative group overflow-hidden transition-shadow"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
                >
                  <motion.div 
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.15 }}
                    transition={{ duration: 0.2 }}
                  />
                  Open Dashboard <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover="hover" initial="initial">
                  <Link to="/login" className="relative text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors px-3 py-2">
                    Sign in
                    <motion.div 
                      className="absolute left-3 right-3 -bottom-0 h-[2px] bg-slate-300 rounded-full origin-center"
                      variants={{
                        initial: { scaleX: 0, opacity: 0 },
                        hover: { scaleX: 1, opacity: 1 }
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white relative overflow-hidden transition-shadow"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-white"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.15 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.div
                      className="absolute -inset-1 blur-xl opacity-0 group-hover:opacity-100"
                      style={{ background: 'inherit' }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10">Get started free</span>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {links.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  {label}
                </a>
              ))}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link to="/login" className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 text-center text-sm font-bold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
                >
                  Get started free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// ─── Particle field canvas ─────────────────────────────────────────────────
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;

    const onResize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    const COUNT = 55;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      });

      // Draw soft connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};

// ─── Typing animation hook ──────────────────────────────────────────────────
const useTyping = (words, speed = 90, pause = 1800) => {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index];
    let timeout;
    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), speed);
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), speed / 2);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, index, words, speed, pause]);

  return displayed;
};

// ─── Floating card components ───────────────────────────────────────────────
const FloatingStatCard = ({ value, label, icon: Icon, color, delay, className }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className={`absolute flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white/90 dark:bg-slate-800/90 border-white/60 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.40)] backdrop-blur-md transition-colors duration-300 ${className}`}
  >
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: color + '18', border: `1.5px solid ${color}30` }}>
      <Icon size={16} style={{ color }} />
    </div>
    <div>
      <div className="text-base font-extrabold text-slate-900 dark:text-white leading-none">{value}</div>
      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{label}</div>
    </div>
  </motion.div>
);

const FloatingNotifCard = ({ delay, className }) => (
  <motion.div
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className={`absolute flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white/94 dark:bg-slate-800/94 border-white/60 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.40)] backdrop-blur-md transition-colors duration-300 ${className}`}
  >
    <div className="relative flex-shrink-0">
      <div className="w-3 h-3 rounded-full bg-emerald-500" />
      <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
    </div>
    <div>
      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Cluster Status</div>
      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">All Systems Operational</div>
    </div>
  </motion.div>
);

// ─── Hero section ───────────────────────────────────────────────────────────
const Hero = ({ userInfo }) => {
  const words = ['Instantly', 'in Seconds', 'at Scale', 'with K8s'];
  const typed = useTyping(words);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-500"
    >
      {/* Dynamic Background Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8faff] via-[#eef1ff] to-[#f8faff] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 opacity-80" />

      {/* Animated particle network */}
      <ParticleCanvas />

      {/* Large blurred orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-24 w-[700px] h-[700px] rounded-full mix-blend-multiply dark:mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 65%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 -right-32 w-[600px] h-[600px] rounded-full mix-blend-multiply dark:mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute -bottom-24 left-1/4 w-[500px] h-[500px] rounded-full mix-blend-multiply dark:mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 65%)' }}
        />
      </div>

      {/* Subtle grid */}
      <NoiseGrid opacity={0.028} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* ── Main content ─────────────────────────────────────────── */}
        <div className="text-center max-w-5xl mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-8 shadow-sm backdrop-blur-sm transition-colors duration-300"
          >
            <motion.span
              animate={{ rotate: [0, 15, -10, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles size={13} />
            </motion.span>
            Self-Service ML Notebook Provisioning
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
              BETA
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-[76px] font-extrabold tracking-tight leading-[1.04] mb-6"
          >
            <span className="text-slate-900 dark:text-white transition-colors duration-300">Provision ML Notebooks</span>
            <br />
            {/* Typing word with gradient + cursor */}
            <span className="relative inline-flex items-baseline gap-3">
              <motion.span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #a855f7 45%, #06b6d4 100%)',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              >
                {typed || '\u00A0'}
              </motion.span>
              {/* blinking cursor */}
              <motion.span
                className="inline-block w-[3px] h-[0.85em] rounded-full mb-1 align-middle"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 transition-colors duration-300"
          >
            Launch GPU-powered Jupyter environments in seconds. Built on Kubernetes for ML teams
            who want to focus on{' '}
            <span className="text-slate-700 dark:text-slate-200 font-semibold">models, not infrastructure.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            {/* Primary — Get Started */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={userInfo ? '/dashboard' : '/register'}
                className="group relative flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white overflow-hidden transition-shadow duration-300"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                  boxShadow: '0 8px 28px rgba(99,102,241,0.50), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                <motion.div 
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.15 }}
                  transition={{ duration: 0.2 }}
                />
                
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                />
                <Zap size={17} className="flex-shrink-0 relative z-10" />
                <span className="relative z-10">{userInfo ? 'Open Dashboard' : 'Get Started Free'}</span>
                <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-200 relative z-10" />
              </Link>
            </motion.div>

            {/* Secondary — View Demo */}
            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-slate-700 dark:text-slate-200 bg-white/85 dark:bg-slate-800/85 backdrop-blur-md border-[1.5px] border-indigo-500/20 dark:border-indigo-400/20 shadow-sm transition-all duration-300"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 2px 8px rgba(99,102,241,0.40)' }}
              >
                <Play size={11} className="text-white ml-0.5" fill="currentColor" />
              </span>
              View Demo
            </motion.a>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium"
          >
            {[
              { icon: CheckCircle2, text: 'No credit card required' },
              { icon: Zap, text: 'Launch in 30 seconds' },
              { icon: Cpu, text: 'GPU support included' },
              { icon: Database, text: 'Persistent storage' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon size={12} className="text-emerald-500" />
                {text}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Dashboard mockup + floating cards ───────────────── */}
        <div className="relative mt-20 mx-auto max-w-5xl">

          {/* Floating stat cards — left side */}
          <FloatingStatCard
            value="< 30s"
            label="Provision time"
            icon={Zap}
            color="#6366f1"
            delay={0.9}
            className="hidden sm:flex -left-10 top-12 z-20"
          />
          <FloatingStatCard
            value="16 GiB"
            label="RAM per pod"
            icon={Cpu}
            color="#0891b2"
            delay={1.05}
            className="hidden sm:flex -left-16 bottom-24 z-20"
          />

          {/* Floating stat cards — right side */}
          <FloatingStatCard
            value="99.9%"
            label="Uptime SLA"
            icon={Activity}
            color="#10b981"
            delay={1.1}
            className="hidden sm:flex -right-10 top-16 z-20"
          />
          <FloatingNotifCard delay={1.25} className="hidden sm:flex -right-14 bottom-20 z-20" />

          {/* Outer glow */}
          <motion.div
            animate={{ opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-6 rounded-[32px] blur-3xl pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)' }}
          />

          {/* Browser chrome — main mockup */}
          <motion.div
            initial={{ opacity: 0, y: 56, scale: 0.94, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
            className="relative"
          >
            <div
              className="relative rounded-[20px] overflow-hidden border shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, #0c1323 0%, #0f172a 100%)',
                borderColor: 'rgba(99,102,241,0.25)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.15)',
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-3 px-5 py-3.5 border-b"
                style={{ background: 'rgba(15,23,42,0.80)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#28ca41' }} />
                </div>
                <div className="flex-1 flex justify-center">
                  <div
                    className="flex items-center gap-2 px-4 py-1 rounded-lg text-xs font-mono text-slate-400"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ml-notebooks.platform.dev/dashboard
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-600 font-mono">
                  <span>v2.4</span>
                </div>
              </div>

              {/* ── Dashboard content ── */}
              <div className="p-5 sm:p-6 grid grid-cols-12 gap-4">

                {/* Sidebar skeleton */}
                <div className="hidden sm:block col-span-2 space-y-3 pt-1">
                  <div className="w-8 h-8 rounded-xl mb-5" style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }} />
                  {[75, 55, 85, 45, 65].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(255,255,255,0.1)' }} />
                      <div className="h-1.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', width: `${w}%` }} />
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="col-span-12 sm:col-span-10 space-y-4">

                  {/* Top bar */}
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-32 rounded" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-20 rounded-lg" style={{ background: 'rgba(99,102,241,0.5)' }} />
                      <div className="h-7 w-7 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { c: '#6366f1', label: 'Running', val: '4' },
                      { c: '#10b981', label: 'Healthy', val: '100%' },
                      { c: '#f59e0b', label: 'CPU Avg', val: '68%' },
                      { c: '#8b5cf6', label: 'Storage', val: '12 GB' },
                    ].map(({ c, label, val }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.07 }}
                        className="rounded-xl p-3 border"
                        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' }}
                      >
                        <div className="w-6 h-6 rounded-lg mb-2 flex items-center justify-center"
                          style={{ background: c + '22', border: `1px solid ${c}35` }}>
                          <div className="w-2.5 h-2.5 rounded" style={{ background: c }} />
                        </div>
                        <div className="text-white text-sm font-bold">{val}</div>
                        <div className="text-slate-500 text-[10px]">{label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart + activity row */}
                  <div className="grid grid-cols-5 gap-3">
                    {/* SVG chart */}
                    <div className="col-span-3 rounded-xl border p-3"
                      style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-[10px] font-semibold">Resource Usage</span>
                        <div className="flex items-center gap-3 text-[9px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#6366f1' }} /> CPU
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#10b981' }} /> RAM
                          </span>
                        </div>
                      </div>
                      <svg viewBox="0 0 120 48" className="w-full h-20" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="hg1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="hg2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0 38 C15 32 25 20 38 24 S55 14 70 18 S88 22 100 14 S115 18 120 16 L120 48 L0 48Z"
                          fill="url(#hg1)" />
                        <path d="M0 38 C15 32 25 20 38 24 S55 14 70 18 S88 22 100 14 S115 18 120 16"
                          fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />
                        {/* Animated dot at end */}
                        <motion.circle cx="120" cy="16" r="2.5" fill="#6366f1"
                          animate={{ r: [2.5, 3.5, 2.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }} />
                        <path d="M0 43 C15 38 25 28 38 32 S55 22 70 26 S88 30 100 22 S115 26 120 24 L120 48 L0 48Z"
                          fill="url(#hg2)" />
                        <path d="M0 43 C15 38 25 28 38 32 S55 22 70 26 S88 30 100 22 S115 26 120 24"
                          fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                    {/* Activity feed */}
                    <div className="col-span-2 rounded-xl border p-3 space-y-2.5"
                      style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.06)' }}>
                      <div className="text-slate-400 text-[10px] font-semibold mb-1">Recent Activity</div>
                      {[
                        { c: '#10b981', t: 'NLP-Research started' },
                        { c: '#6366f1', t: 'DeepLearn created' },
                        { c: '#f59e0b', t: 'CV-Pipeline pending' },
                        { c: '#ef4444', t: 'GPT-Fine-Tune stopped' },
                      ].map(({ c, t }, i) => (
                        <motion.div
                          key={t}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + i * 0.08 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} />
                          <span className="text-slate-500 text-[9px] truncate">{t}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Notebook table rows */}
                  <div className="rounded-xl border overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.055)' }}>
                    {/* Header */}
                    <div className="grid grid-cols-12 px-3 py-1.5 border-b"
                      style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)' }}>
                      {['Name', 'CPU', 'RAM', 'Status'].map((h) => (
                        <div key={h} className="col-span-3 text-[9px] font-bold text-slate-600 uppercase tracking-wider">{h}</div>
                      ))}
                    </div>
                    {[
                      { color: '#6366f1', name: 'NLP-Research', cpu: '3/4', ram: '8 GiB', status: 'Running', sc: '#6366f1' },
                      { color: '#f59e0b', name: 'CV-Pipeline', cpu: '1/4', ram: '4 GiB', status: 'Pending', sc: '#f59e0b' },
                      { color: '#10b981', name: 'DeepLearn-Lab', cpu: '4/4', ram: '16 GiB', status: 'Running', sc: '#10b981' },
                    ].map(({ color, name, cpu, ram, status, sc }, i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 + i * 0.06 }}
                        className="grid grid-cols-12 items-center px-3 py-2 border-b"
                        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                      >
                        <div className="col-span-3 flex items-center gap-2">
                          <div className="w-4 h-4 rounded-lg flex-shrink-0" style={{ background: color + '25' }} />
                          <span className="text-[10px] text-slate-300 font-medium truncate">{name}</span>
                        </div>
                        <div className="col-span-3 text-[10px] text-slate-500 font-mono">{cpu}</div>
                        <div className="col-span-3 text-[10px] text-slate-500 font-mono">{ram}</div>
                        <div className="col-span-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ background: sc + '22', color: sc }}>
                            <span className="w-1 h-1 rounded-full" style={{ background: sc }} />
                            {status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gradient edge fade */}
      <div className="absolute bottom-0 inset-x-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(248,250,255,1), transparent)' }} />
    </section>
  );
};

// ─── Stats bar ──────────────────────────────────────────────────────────────
const StatsBar = () => {
  const stats = [
    { value: '< 30s', label: 'Notebook provision time' },
    { value: '99.9%', label: 'Platform uptime SLA' },
    { value: '4 vCPU', label: 'Max quota per user' },
    { value: '16 GiB', label: 'RAM per environment' },
    { value: '50 GiB', label: 'Persistent storage' },
  ];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-16 border-y border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-white to-[#f8f9ff] dark:from-slate-950 dark:to-slate-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className="text-center"
            >
              <div className="text-3xl font-extrabold tracking-tight mb-1"
                style={{ backgroundImage: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {value}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Features section ───────────────────────────────────────────────────────
// ─── Features section ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Terminal,
    title: 'On-demand notebooks',
    description: 'Instantly spin up fully configured Jupyter environments when you need them. No waiting times or infrastructure hurdles.',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #7c3aed)',
  },
  {
    icon: Cpu,
    title: 'Resource control',
    description: 'Dynamically allocate CPU and RAM limits to match the specific demands of your workloads, preventing runaway costs.',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2, #6366f1)',
  },
  {
    icon: Database,
    title: 'Persistent storage',
    description: 'Ensure data durability with built-in Kubernetes Persistent Volume Claims. Close your notebook and resume later without data loss.',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #0891b2)',
  },
  {
    icon: Shield,
    title: 'Kubernetes isolation',
    description: 'Run every notebook inside isolated pods. Guaranteeing secure environments, zero cross-user interference, and dedicated resources.',
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706, #ef4444)',
  },
];

const Features = () => (
  <section id="features" className="py-24 relative overflow-hidden bg-gradient-to-br from-[#f8faff] to-white dark:from-slate-900 dark:to-slate-950 transition-colors duration-500">
    {/* Background elements for glassmorphism pop */}
    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-400/15 dark:bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Section className="text-center max-w-3xl mx-auto mb-16">
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 backdrop-blur-md text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4 transition-colors duration-300">
          <Sparkles size={11} /> Features
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5 transition-colors duration-300">
          Everything your ML team needs
        </motion.h2>
        <motion.p variants={fadeUp} className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed transition-colors duration-300">
          Stop wasting time on infrastructure. Focus entirely on building models with our
          high-performance, secure self-service platform.
        </motion.p>
      </Section>

      <Section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURES.map(({ icon: Icon, title, description, color, gradient }, i) => (
          <motion.div
            key={title}
            variants={fadeUp}
            whileHover={{ scale: 1.03, y: -6, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
            className="group relative p-8 rounded-3xl cursor-default transition-all duration-300 bg-white/45 dark:bg-slate-800/40 backdrop-blur-md border border-white/65 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            {/* Hover gradient subtle background shift */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(circle at 100% 0%, ${color}0C, transparent 70%)` }} />

            {/* Icon */}
            <div className="relative w-14 h-14 rounded-[18px] mb-6 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
              style={{ background: gradient, boxShadow: `0 8px 20px ${color}40`, border: `1px solid rgba(255,255,255,0.2)` }}>
              <Icon size={24} className="text-white relative z-10" />
              <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-indigo-950 dark:group-hover:text-indigo-300 transition-colors">{title}</h3>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium transition-colors">{description}</p>
          </motion.div>
        ))}
      </Section>
    </div>
  </section>
);

// ─── Interactive Demo section ───────────────────────────────────────────────
const InteractiveDemo = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        return p + 1.5; // Smooth progression
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 3500);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  const isRunning = progress === 100;

  return (
    <section id="demo" className="py-24 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
            <MonitorPlay size={11} /> Interactive Demo
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-5">
            Watch it in action
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-2xl mx-auto">
            Experience the provisioning flow live. No complicated YAML files — just zero-friction Jupyter environments booted up in seconds.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[24px] border border-slate-700/60 bg-[#0f172a]/90 backdrop-blur-xl shadow-2xl overflow-hidden max-w-4xl mx-auto"
        >
          {/* Mock Window Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28ca41]" />
            </div>
            
            {/* Live Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Status: All systems operational
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column - Provisioning Progress */}
              <div className="col-span-2 space-y-6">
                
                {/* Progress Card */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                    <div className="flex items-center gap-2">
                      <Terminal size={16} className="text-indigo-400" />
                      <span>Provisioning "Deep Learning GPU"</span>
                    </div>
                    <span className="text-indigo-400 tabular-nums">{Math.floor(progress)}%</span>
                  </div>
                  
                  {/* Animated Loading Bar */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "linear", duration: 0.05 }}
                    />
                  </div>
                </div>

                {/* Terminal logs */}
                <div className="bg-[#0c111d] rounded-2xl p-5 font-mono text-[12px] text-slate-400 h-44 overflow-hidden border border-slate-700/50 relative shadow-inner">
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0c111d] to-transparent z-10" />
                  <div className="space-y-2 opacity-90">
                    <p className="text-indigo-400">] Authenticating user...</p>
                    {progress > 5 && <p className="text-emerald-400">] Auth Success. Quota verified.</p>}
                    {progress > 15 && <p className="text-slate-300">] Allocating resources: 4 vCPU, 16GiB RAM, 1x NVIDIA GPU...</p>}
                    {progress > 30 && <p className="text-slate-300">] Creating Kubernetes PVC: nb-deep-learn-pvc...</p>}
                    {progress > 45 && <p className="text-slate-300">] PersistentVolume attached (50GiB).</p>}
                    {progress > 60 && <p className="text-slate-300">] Pulling image 'ml-notebook:v2.4' from container registry...</p>}
                    {progress > 80 && <p className="text-slate-300">] Pod scheduling on node 'gpu-pool-alpha'...</p>}
                    {progress >= 100 && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 font-bold">
                        ] Provisioning Complete. Secure ingress route created.
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Status Badges & Fake Notebook Dashboard */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Active Instances</div>
                
                {/* Always Running Fake Notebook */}
                <div className="p-4 rounded-2xl border border-slate-700 bg-slate-800/40 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-bold text-slate-200 mb-1">Data-Prep-Cluster</div>
                    <div className="text-[11px] text-slate-500 font-mono">2 vCPU • 4 GiB</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Running
                  </span>
                </div>

                {/* Animated Fake Notebook */}
                <div className="p-4 rounded-2xl border transition-colors duration-300 flex items-center justify-between"
                     style={{ borderColor: isRunning ? 'rgba(99,102,241,0.3)' : 'rgba(51,65,85,1)', background: isRunning ? 'rgba(99,102,241,0.05)' : 'rgba(30,41,59,0.4)' }}>
                  <div>
                    <div className="text-[13px] font-bold text-white mb-1">Deep Learning GPU</div>
                    <div className="text-[11px] text-slate-500 font-mono">4 vCPU • 16 GiB</div>
                  </div>
                  {!isRunning ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                      <Clock size={10} className="animate-[spin_4s_linear_infinite]" /> Pending
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Running
                    </span>
                  )}
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── How it works ───────────────────────────────────────────────────────────
const STEPS = [
  {
    step: '01',
    title: 'Create an account',
    description: 'Register in 30 seconds. No credit card, no complex setup. Start with your university or work email.',
    icon: Users,
  },
  {
    step: '02',
    title: 'Configure your notebook',
    description: 'Choose CPU cores, RAM, and storage. Name your environment and click Create — Kubernetes handles the rest.',
    icon: Layers,
  },
  {
    step: '03',
    title: 'Launch & Code',
    description: 'Your Jupyter environment is ready in seconds. Access it via the secure URL and start building models.',
    icon: Terminal,
  },
  {
    step: '04',
    title: 'Monitor & Manage',
    description: 'Track live resource usage, reconnect stopped notebooks, and manage your full ML environment from one dashboard.',
    icon: BarChart2,
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24"
    style={{ background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Section className="text-center max-w-3xl mx-auto mb-16">
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-widest mb-4">
          <Clock size={11} /> How it works
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-5">
          Up and running in 4 steps
        </motion.h2>
        <motion.p variants={fadeUp} className="text-lg text-slate-500">
          From zero to a running Jupyter notebook faster than making a coffee.
        </motion.p>
      </Section>

      <Section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map(({ step, title, description, icon: Icon }, i) => (
          <motion.div
            key={step}
            variants={fadeUp}
            className="relative group"
          >
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-[calc(100%_-_12px)] w-6 h-px bg-gradient-to-r from-indigo-300 to-violet-200 z-10" />
            )}

            <div className="p-7 rounded-2xl bg-white border border-slate-200/70 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 h-full">
              {/* Step number */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-3xl font-black text-slate-100 group-hover:text-indigo-100 transition-colors tabular-nums"
                  style={{ WebkitTextStroke: '1px #e2e8f0' }}>
                  {step}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          </motion.div>
        ))}
      </Section>
    </div>
  </section>
);

// ─── Why Choose Us section ──────────────────────────────────────────────────
const REASONS = [
  {
    title: 'Real-time notebook execution',
    description: 'Instantly launch into active computing sessions without waiting in queues. Spin up environments exactly when you need them.',
    icon: Zap,
    color: '#6366f1' // indigo
  },
  {
    title: 'Secure authentication (JWT)',
    description: 'Stateless, cryptographically secure JSON Web Tokens ensure your notebooks, API access, and underlying data are completely protected.',
    icon: Shield,
    color: '#10b981' // emerald
  },
  {
    title: 'Resource isolation (Kubernetes)',
    description: 'Strict pod-level constraints and cgroups guarantee your workloads get exactly the dedicated CPU and RAM you requested with zero noisy-neighbor impact.',
    icon: Server,
    color: '#f59e0b' // amber
  },
  {
    title: 'Data persistence (PVC)',
    description: 'Your progress is saved via Kubernetes Persistent Volume Claims. Shut down your notebook and resume exactly where you left off tomorrow.',
    icon: HardDrive,
    color: '#0ea5e9' // sky
  }
];

const WhyChooseUs = () => {
  return (
    <section id="why-choose-us" className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section className="text-center max-w-3xl mx-auto mb-24">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs font-bold uppercase tracking-widest mb-4 transition-colors">
            <CheckCircle2 size={11} /> Platform Value
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5 transition-colors">
            Why Choose Our Platform
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-slate-500 dark:text-slate-400 transition-colors">
            Engineered for security, speed, and reliability. We provide an enterprise-grade foundation for your ML workflows.
          </motion.p>
        </Section>

        <Section className="relative max-w-5xl mx-auto pb-8">
          {/* Vertical Timeline Line */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-slate-200 via-indigo-100 to-transparent -translate-x-1/2 rounded-full" />

          <div className="space-y-16 md:space-y-24 relative z-10">
            {REASONS.map(({ title, description, icon: Icon, color }, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`relative flex flex-col md:flex-row items-center justify-between ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Empty half for desktop alignment */}
                  <div className="hidden md:block md:w-2/5" />

                  {/* Center Node */}
                  <div className="absolute left-6 md:left-1/2 w-14 h-14 rounded-full border-[6px] border-slate-50 dark:border-slate-950 flex items-center justify-center bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-none z-10 -translate-x-1/2 md:translate-x-[-50%] transform transition-transform duration-300 hover:scale-110">
                    <Icon size={22} style={{ color }} />
                  </div>

                  {/* Content Card */}
                  <div className="w-full md:w-2/5 pl-20 md:pl-0">
                    <div className={`p-8 rounded-3xl bg-white dark:bg-[#0d1422] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden ${isEven ? 'md:text-right' : 'md:text-left'} text-left`}>
                      {/* Subdued background glow on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: color }} />
                      
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${isEven ? 'md:ml-auto md:mr-0 ml-0 mr-auto' : ''}`} style={{ background: `${color}15`, color }}>
                        <Icon size={24} />
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight transition-colors">{title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-[15px] transition-colors">{description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Section>
      </div>
    </section>
  );
};

// ─── Tech stack section ─────────────────────────────────────────────────────
const TECH = [
  { name: 'Kubernetes', icon: Server, color: '#326CE5', blurColor: 'rgba(50,108,229,0.3)', desc: 'Container Orchestration' },
  { name: 'Docker', icon: Layers, color: '#2496ED', blurColor: 'rgba(36,150,237,0.3)', desc: 'Image runtime' },
  { name: 'Jupyter', icon: Terminal, color: '#F37626', blurColor: 'rgba(243,118,38,0.3)', desc: 'Interactive Notebooks' },
  { name: 'Node.js', icon: Zap, color: '#339933', blurColor: 'rgba(51,153,51,0.3)', desc: 'Backend Services' },
];

const TechStack = () => (
  <section id="tech-stack" className="py-24 bg-white dark:bg-[#0d1422] relative overflow-hidden transition-colors duration-500">
    {/* Subtle gradient sweeps for motion on scroll */}
    <motion.div 
      style={{ y: useTransform(useScroll().scrollY, [0, 2000], [0, 150]) }}
      className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-slate-50/50 dark:from-slate-900/50 to-transparent pointer-events-none transition-colors" 
    />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <Section className="text-center max-w-3xl mx-auto mb-16">
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-bold uppercase tracking-widest mb-4 transition-colors">
          <Globe size={11} /> Tech Stack
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5 transition-colors">
          Built with industry standards
        </motion.h2>
        <motion.p variants={fadeUp} className="text-lg text-slate-500 dark:text-slate-400 transition-colors">
          We leverage the best open-source technologies to ensure maximum reliability, security, and developer joy.
        </motion.p>
      </Section>

      <Section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {TECH.map(({ name, icon: Icon, color, blurColor, desc }) => (
          <motion.div
            key={name}
            variants={fadeUp}
            whileHover={{ y: -8, scale: 1.05 }}
            className="group relative flex flex-col items-center gap-4 p-8 rounded-3xl bg-transparent transition-all duration-300 cursor-default cursor-pointer"
            style={{ zIndex: 1 }}
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
                 style={{ background: blurColor }} />
                 
            {/* White card background to mask glow underneath */}
            <div className="absolute inset-0 rounded-3xl bg-white dark:bg-[#151f2e] border border-slate-200 dark:border-slate-800 shadow-sm transition-shadow duration-300 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] -z-10" />

            <motion.div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-inner"
            >
              <motion.div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ background: color }}
              />
              <motion.div
                whileHover={{ rotate: 15, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Icon size={28} style={{ color }} />
              </motion.div>
            </motion.div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">{desc}</p>
            </div>
          </motion.div>
        ))}
      </Section>
    </div>
  </section>
);

// ─── Pricing section ────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for students and exploratory projects.',
    cta: 'Get started free',
    ctaVariant: 'outline',
    features: [
      '1 concurrent notebook',
      'Up to 2 vCPU',
      'Up to 4 GiB RAM',
      '5 GiB persistent storage',
      'Community support',
      'Public Beta access',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For ML engineers who need serious computing power.',
    cta: 'Start Pro trial',
    ctaVariant: 'primary',
    highlighted: true,
    badge: 'Most popular',
    features: [
      '5 concurrent notebooks',
      'Up to 8 vCPU per notebook',
      'Up to 32 GiB RAM',
      '50 GiB persistent storage',
      'GPU quota (NVIDIA T4)',
      'Priority email support',
      'Custom resource limits',
    ],
  },
  {
    name: 'Team',
    price: '$99',
    period: '/month',
    description: 'For teams who need shared workspaces and admin controls.',
    cta: 'Contact us',
    ctaVariant: 'outline',
    features: [
      'Unlimited notebooks',
      'Up to 16 vCPU per notebook',
      'Up to 64 GiB RAM',
      '500 GiB shared storage',
      'GPU quota (NVIDIA A100)',
      'Admin console',
      'SSO & role management',
      'SLA uptime guarantee',
    ],
  },
];

const Pricing = () => (
  <section id="pricing" className="py-24 bg-gradient-to-b from-[#f8f9ff] to-white dark:from-slate-900 dark:to-[#0d1422] transition-colors duration-500">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Section className="text-center max-w-3xl mx-auto mb-14">
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 transition-colors">
          <Star size={11} /> Pricing
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5 transition-colors">
          Simple, transparent pricing
        </motion.h2>
        <motion.p variants={fadeUp} className="text-lg text-slate-500 dark:text-slate-400 transition-colors">
          No hidden fees, no complex tiers. Start free and upgrade when you need more power.
        </motion.p>
      </Section>

      <Section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {PLANS.map(({ name, price, period, description, cta, features, highlighted, badge }) => (
          <motion.div
            key={name}
            variants={fadeUp}
            className={`relative rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
              highlighted
                ? 'shadow-2xl shadow-indigo-500/15'
                : 'bg-white dark:bg-[#151f2e] border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700'
            }`}
            style={highlighted ? {
              background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
              borderColor: 'rgba(99,102,241,0.4)',
            } : {}}
          >
            {highlighted && badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
                  <Star size={10} fill="currentColor" /> {badge}
                </span>
              </div>
            )}

            <div className={`text-sm font-bold uppercase tracking-widest mb-3 ${highlighted ? 'text-indigo-400' : 'text-slate-500'}`}>
              {name}
            </div>

            <div className={`flex items-baseline gap-1 mb-2 ${highlighted ? 'text-white' : 'text-slate-900 dark:text-white transition-colors'}`}>
              <span className="text-4xl font-extrabold">{price}</span>
              <span className={`text-sm font-medium ${highlighted ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500 transition-colors'}`}>{period}</span>
            </div>

            <p className={`text-sm mb-7 leading-relaxed ${highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
              {description}
            </p>

            <Link
              to="/register"
              className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-px mb-7 ${
                highlighted
                  ? 'text-white hover:opacity-90'
                  : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300'
              }`}
              style={highlighted ? {
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
              } : {}}
            >
              {cta} <ArrowRight size={14} />
            </Link>

            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`flex-shrink-0 mt-0.5 ${highlighted ? 'text-indigo-400' : 'text-emerald-500 dark:text-emerald-400'}`} />
                  <span className={`text-sm ${highlighted ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400 transition-colors'}`}>{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </Section>
    </div>
  </section>
);

// ─── Testimonials ───────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'ML Engineer, Google',
    avatar: 'PS',
    color: '#6366f1',
    quote: 'We went from "who manages the infrastructure?" to launching Jupyter notebooks in one click. Game changer for our research team.',
  },
  {
    name: 'Alex Chen',
    role: 'Data Scientist, Meta',
    avatar: 'AC',
    color: '#0891b2',
    quote: 'The Kubernetes isolation means nobody fights over GPUs anymore. Real-time monitoring shows me exactly what my training job is consuming.',
  },
  {
    name: 'Rahul Verma',
    role: 'AI Researcher, IIT Delhi',
    avatar: 'RV',
    color: '#7c3aed',
    quote: 'Persistent storage saved my PhD project twice when pods restarted. I don\'t think about infra anymore — just science.',
  },
];

const Testimonials = () => (
  <section className="py-24 bg-white dark:bg-[#0d1422] transition-colors duration-500">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Section className="text-center max-w-3xl mx-auto mb-14">
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-4 transition-colors">
          <Star size={11} /> Testimonials
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5 transition-colors">
          Loved by ML teams
        </motion.h2>
      </Section>

      <Section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map(({ name, role, avatar, color, quote }) => (
          <motion.div
            key={name}
            variants={fadeUp}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-7 rounded-2xl bg-white dark:bg-[#151f2e] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all duration-300"
          >
            {/* Stars */}
            <div className="flex items-center gap-0.5 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
              ))}
            </div>

            <p className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed mb-6 italic transition-colors">"{quote}"</p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }}>
                {avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 transition-colors">{name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 transition-colors">{role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </Section>
    </div>
  </section>
);

// ─── CTA section ────────────────────────────────────────────────────────────
const CTASection = ({ userInfo }) => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }} />
    <Orbs />
    <NoiseGrid opacity={0.04} />

    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <Section>
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-semibold mb-6">
          <Zap size={13} /> Ready to launch?
        </motion.div>

        <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          <span className="text-white">Start building with</span>
          <br />
          <span className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)' }}>
            ML Notebooks today
          </span>
        </motion.h2>

        <motion.p variants={fadeUp} className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join the next generation of ML engineers who provision environments in seconds,
          not hours. No infrastructure headaches, ever again.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={userInfo ? '/dashboard' : '/register'}
              className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white relative overflow-hidden transition-shadow"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                boxShadow: '0 6px 28px rgba(99,102,241,0.50)',
              }}
            >
              <motion.div 
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.15 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="absolute -inset-1 blur-2xl opacity-0 group-hover:opacity-100"
                style={{ background: 'inherit' }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center gap-2.5">
                <Zap size={16} />
                {userInfo ? 'Open Dashboard' : 'Get started for free'}
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/login"
              className="relative group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-slate-300 border border-slate-700 overflow-hidden"
            >
              <motion.div 
                className="absolute inset-0 bg-slate-800"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <span className="relative z-10 group-hover:text-white transition-colors duration-200">
                Sign in to your account
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </Section>
    </div>
  </section>
);

// ─── Footer ──────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
              <Zap size={15} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-white">ML Notebooks</span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            A self-service platform for provisioning Jupyter ML environments on Kubernetes.
          </p>
          <div className="flex items-center gap-3">
            {[[Github, 'GitHub'], [Twitter, 'Twitter'], [Linkedin, 'LinkedIn']].map(([Icon, label]) => (
              <a key={label} href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {[
          { heading: 'Product', links: ['Features', 'Pricing', 'How it works', 'Changelog', 'Roadmap'] },
          { heading: 'Developers', links: ['Documentation', 'API Reference', 'GitHub', 'Status Page', 'CLI'] },
          { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact', 'Privacy Policy'] },
        ].map(({ heading, links }) => (
          <div key={heading}>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">{heading}</h4>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-slate-500 hover:text-slate-200 transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        <p>© {new Date().getFullYear()} ML Notebooks Platform. All rights reserved.</p>
        <p className="text-slate-700">University Project — Educational purposes only</p>
      </div>
    </div>
  </footer>
);

// ─── Root component ──────────────────────────────────────────────────────────
const LandingScreen = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar userInfo={userInfo} />
      <main>
        <Hero userInfo={userInfo} />
        <StatsBar />
        <Features />
        <InteractiveDemo />
        <HowItWorks />
        <WhyChooseUs />
        <TechStack />
        <Pricing />
        <Testimonials />
        <CTASection userInfo={userInfo} />
      </main>
      <Footer />
    </div>
  );
};

export default LandingScreen;
