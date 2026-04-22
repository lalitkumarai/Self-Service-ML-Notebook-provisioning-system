import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Plus, Search, RefreshCw, Terminal, FolderOpen, Inbox, AlertTriangle } from 'lucide-react';

const PRESETS = {
  notebooks: {
    icon: Terminal,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-400',
    title: 'No notebooks yet',
    description: 'Spin up your first ML environment with custom CPU, RAM, and GPU resources.',
    cta: 'Create Your First Notebook',
    ctaIcon: Plus,
    ctaVariant: 'primary',
  },
  search: {
    icon: Search,
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-400',
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria to find what you\'re looking for.',
    cta: 'Clear search',
    ctaVariant: 'secondary',
  },
  activity: {
    icon: Inbox,
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-300',
    title: 'No activity yet',
    description: 'Events will appear here as you create and manage notebooks.',
    cta: null,
  },
  empty: {
    icon: FolderOpen,
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-300',
    title: 'Nothing here',
    description: 'This section is empty.',
    cta: null,
  },
  error: {
    icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-400',
    title: 'Something went wrong',
    description: 'We hit an error loading this content. Please try again.',
    cta: 'Retry',
    ctaIcon: RefreshCw,
    ctaVariant: 'danger',
  },
};

const EmptyState = ({
  preset = 'empty',
  icon: IconOverride,
  title,
  description,
  cta,
  ctaIcon,
  ctaVariant,
  onAction,
  className,
  size = 'md',
}) => {
  const cfg = PRESETS[preset] ?? PRESETS.empty;

  const Icon       = IconOverride ?? cfg.icon;
  const finalTitle = title       ?? cfg.title;
  const finalDesc  = description ?? cfg.description;
  const finalCta   = cta        ?? cfg.cta;
  const CtaIcon    = ctaIcon    ?? cfg.ctaIcon;
  const variant    = ctaVariant ?? cfg.ctaVariant;

  const sizeMap = {
    sm: { wrapper: 'py-8',  iconBox: 'w-12 h-12', iconBoxR: 'rounded-xl', icon: 16, title: 'text-sm', desc: 'text-xs', btn: 'px-3.5 py-2 text-xs' },
    md: { wrapper: 'py-14', iconBox: 'w-16 h-16', iconBoxR: 'rounded-2xl', icon: 22, title: 'text-sm', desc: 'text-sm', btn: 'px-5 py-2.5 text-sm' },
    lg: { wrapper: 'py-20', iconBox: 'w-20 h-20', iconBoxR: 'rounded-2xl', icon: 28, title: 'text-base', desc: 'text-sm', btn: 'px-6 py-3 text-sm' },
  };
  const s = sizeMap[size] ?? sizeMap.md;

  const variantBtn = {
    primary:   'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-indigo-600/35 active:scale-95',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95',
    danger:    'bg-red-600 text-white shadow-md shadow-red-500/25 hover:bg-red-700 active:scale-95',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={clsx('flex flex-col items-center justify-center text-center', s.wrapper, className)}
    >
      {/* Icon orb */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.34, 1.56, 0.64, 1] }}
        className={clsx('flex items-center justify-center mx-auto mb-5', s.iconBox, s.iconBoxR, cfg.iconBg)}
      >
        <Icon size={s.icon} className={cfg.iconColor} />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={clsx('font-bold text-slate-800 mb-1.5', s.title)}
      >
        {finalTitle}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className={clsx('text-slate-400 max-w-xs mx-auto leading-relaxed mb-6', s.desc)}
      >
        {finalDesc}
      </motion.p>

      {/* CTA button */}
      {finalCta && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onAction}
          className={clsx(
            'inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200',
            s.btn,
            variantBtn[variant] ?? variantBtn.primary
          )}
        >
          {CtaIcon && <CtaIcon size={15} />}
          {finalCta}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
