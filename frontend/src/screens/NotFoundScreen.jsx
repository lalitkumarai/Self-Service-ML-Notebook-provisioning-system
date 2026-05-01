import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const glitchVariants = {
    initial: { x: 0 },
    animate: {
      x: [0, -4, 4, -2, 2, 0],
      transition: { duration: 0.4, repeat: Infinity, repeatDelay: 3 },
    },
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background orbs */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ textAlign: 'center', maxWidth: '600px', width: '100%', zIndex: 1 }}
      >
        {/* 404 Number */}
        <motion.div variants={itemVariants}>
          <motion.h1
            variants={glitchVariants}
            initial="initial"
            animate="animate"
            style={{
              fontSize: 'clamp(8rem, 20vw, 14rem)',
              fontWeight: '800',
              lineHeight: 1,
              margin: 0,
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.05em',
              userSelect: 'none',
            }}
          >
            404
          </motion.h1>
        </motion.div>

        {/* Icon */}
        <motion.div variants={itemVariants} style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Search size={32} color="#a855f7" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          variants={itemVariants}
          style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#f1f5f9',
            marginBottom: '0.75rem',
          }}
        >
          Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: '1rem',
            color: '#94a3b8',
            lineHeight: '1.7',
            marginBottom: '0.5rem',
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        {/* Path display */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'inline-block',
            padding: '0.4rem 1rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '6px',
            marginBottom: '2.5rem',
          }}
        >
          <code
            style={{
              fontSize: '0.85rem',
              color: '#f87171',
              fontFamily: "'Courier New', monospace",
            }}
          >
            {location.pathname}
          </code>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: '10px',
              color: '#a5b4fc',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <ArrowLeft size={18} />
            Go Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
              transition: 'all 0.2s ease',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Home size={18} />
            Home
          </motion.button>
        </motion.div>

        {/* Helpful links */}
        <motion.div
          variants={itemVariants}
          style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Quick links
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Login', path: '/login' },
              { label: 'Register', path: '/register' },
            ].map(({ label, path }) => (
              <motion.button
                key={path}
                whileHover={{ color: '#a855f7' }}
                onClick={() => navigate(path)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'color 0.2s ease',
                }}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundScreen;
