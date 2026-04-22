import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

// ─── Feature list for hero panel ─────────────────────────────────────────────
const FEATURES = [
  { icon: Zap,          text: 'GPU-accelerated Jupyter notebooks' },
  { icon: Shield,       text: 'Enterprise-grade security & isolation' },
  { icon: CheckCircle2, text: 'One-click provisioning in under 30s' },
];

// ─── Floating orb background ─────────────────────────────────────────────────
const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
      style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
    <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
    <div className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full opacity-10"
      style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
  </div>
);

// ─── Input field ──────────────────────────────────────────────────────────────
const FormInput = ({
  id, type = 'text', icon: Icon, value, onChange, placeholder, required,
  suffix, error, autoComplete,
}) => (
  <div className="relative">
    {/* Left icon */}
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
      <Icon size={16} className="text-slate-400 transition-colors" />
    </div>
    <input
      id={id}
      type={type}
      required={required}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full pl-10 pr-${suffix ? '10' : '4'} py-3 rounded-xl border text-sm
        bg-white text-slate-900 placeholder-slate-400
        transition-all duration-200 outline-none
        ${error
          ? 'border-red-300 ring-2 ring-red-100'
          : 'border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100'
        }
      `}
      style={{ boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.04)' }}
    />
    {suffix}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const LoginScreen = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [focused, setFocused]           = useState(null);

  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(
        err.response?.data?.message ?? err.message ?? 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Stagger variants
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden:  { opacity: 0, y: 14 },
    show:    { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <div className="flex min-h-screen bg-white">

      {/* ── Left hero panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-5/12 relative overflow-hidden flex-col justify-between">
        {/* Dark background */}
        <div className="absolute inset-0 bg-slate-925" style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }} />

        {/* Floating background orbs */}
        <FloatingOrbs />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">ML Notebooks</span>
              <span className="block text-indigo-300/70 text-[11px] font-medium tracking-widest uppercase">Platform</span>
            </div>
          </motion.div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 mb-6">
                <Sparkles size={12} className="text-indigo-400" />
                <span className="text-indigo-300 text-xs font-semibold tracking-wide">Self-Service ML Platform</span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-4">
                Welcome back,<br />
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  ready to code?
                </span>
              </h1>

              <p className="text-slate-400 text-base leading-relaxed mb-8">
                Your GPU-powered Jupyter notebooks are waiting. Continue your machine learning journey.
              </p>

              {/* Feature list */}
              <div className="space-y-3.5">
                {FEATURES.map(({ icon: Icon, text }, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-indigo-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-slate-600 text-xs"
          >
            © 2026 ML Notebooks · Enterprise-grade security
          </motion.div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-5 sm:px-10 lg:px-16 xl:px-24 bg-slate-50 relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-indigo-50/20 pointer-events-none" />

        <div className="relative w-full max-w-md mx-auto">

          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:hidden mb-10 flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">ML Notebooks</span>
          </motion.div>

          {/* Form card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="bg-white rounded-2xl border border-slate-200/70 p-8 shadow-xl shadow-slate-200/50"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">Sign in</h2>
              <p className="text-sm text-slate-500">
                New to the platform?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors underline underline-offset-2"
                >
                  Create a free account
                </Link>
              </p>
            </motion.div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mb-5 overflow-hidden"
                >
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-[10px] font-bold">!</span>
                    </div>
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={submitHandler}>
              <div className="space-y-5">
                {/* Email */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <FormInput
                    id="email"
                    type="email"
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    autoComplete="email"
                  />
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormInput
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    icon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword
                          ? <EyeOff size={16} />
                          : <Eye size={16} />
                        }
                      </button>
                    }
                  />
                </motion.div>

                {/* Submit */}
                <motion.div variants={itemVariants} className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`
                      w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl
                      text-sm font-semibold text-white
                      transition-all duration-200
                      ${loading
                        ? 'bg-indigo-500 cursor-not-allowed opacity-80'
                        : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
                      }
                    `}
                    style={loading ? {} : { boxShadow: '0 4px 14px rgb(99 102 241 / 0.35)' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </motion.div>
              </div>
            </form>

            {/* Divider */}
            <motion.div variants={itemVariants} className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                Protected by enterprise-grade encryption
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;