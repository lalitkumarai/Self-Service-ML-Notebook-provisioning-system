import { motion } from 'framer-motion';

/**
 * PageLoader — Full-screen fallback loading UI.
 * Used by React.Suspense for lazy-loaded routes and by
 * PrivateRoute while auth state resolves.
 *
 * Props:
 *   message  — optional status string shown below the spinner
 *   mini     — if true, renders a compact inline version (no full-screen)
 */
const PageLoader = ({ message = 'Loading…', mini = false }) => {
  if (mini) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94a3b8', fontSize: '0.9rem' }}>
        <SpinnerSVG size={20} />
        {message}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={message}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <LogoMark />
      </motion.div>

      {/* Spinner ring */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <SpinnerSVG size={48} />
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ position: 'relative', zIndex: 1, width: '180px' }}
      >
        <div
          style={{
            height: '3px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '99px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              height: '100%',
              width: '60%',
              background: 'linear-gradient(90deg, transparent, #6366f1, #a855f7, transparent)',
              borderRadius: '99px',
            }}
          />
        </div>
      </motion.div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        style={{
          position: 'relative',
          zIndex: 1,
          color: '#94a3b8',
          fontSize: '0.875rem',
          fontWeight: '500',
          margin: 0,
          letterSpacing: '0.03em',
        }}
      >
        {message}
      </motion.p>
    </div>
  );
};

/* ── Logo Mark ─────────────────────────────────────────────── */
const LogoMark = () => (
  <div
    style={{
      width: '64px',
      height: '64px',
      borderRadius: '18px',
      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 32px rgba(99,102,241,0.45)',
    }}
  >
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="10" height="10" rx="2" fill="white" fillOpacity="0.9" />
      <rect x="20" y="6" width="10" height="10" rx="2" fill="white" fillOpacity="0.55" />
      <rect x="6" y="20" width="10" height="10" rx="2" fill="white" fillOpacity="0.55" />
      <rect x="20" y="20" width="10" height="10" rx="2" fill="white" fillOpacity="0.9" />
    </svg>
  </div>
);

/* ── Spinner SVG ────────────────────────────────────────────── */
const SpinnerSVG = ({ size = 48 }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={{ rotate: 360 }}
    transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
  >
    <circle cx="24" cy="24" r="20" stroke="rgba(99,102,241,0.15)" strokeWidth="4" />
    <path
      d="M44 24 A20 20 0 0 0 24 4"
      stroke="url(#spinnerGrad)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="spinnerGrad" x1="24" y1="4" x2="44" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
  </motion.svg>
);

export default PageLoader;
