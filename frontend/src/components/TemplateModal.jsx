import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, BarChart2, GitBranch, Tag, Brain, ChevronRight, Check } from 'lucide-react';
import axios from 'axios';

const iconMap = { '📊': BarChart2, '📈': GitBranch, '🏷️': Tag, '🧠': Brain };

const TemplateModal = ({ isOpen, onClose, onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    axios.get('/api/templates')
      .then(r => setTemplates(r.data.templates || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleApply = async () => {
    if (!selected) return;
    setApplying(true);
    try {
      const r = await axios.get(`/api/templates/${selected}`);
      onSelect(r.data.template);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setApplying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-2xl bg-[#0f1117] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Sparkles size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Choose a Template</h2>
                  <p className="text-xs text-slate-500">Pre-built notebooks to get you started instantly</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Templates Grid */}
            <div className="p-6">
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((t, i) => {
                    const isActive = selected === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelected(t.id)}
                        className={`relative text-left p-4 rounded-2xl border transition-all duration-200 ${
                          isActive
                            ? 'bg-indigo-500/15 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                            : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                            <Check size={11} className="text-white" strokeWidth={3} />
                          </span>
                        )}
                        <span className="text-2xl mb-2 block">{t.icon}</span>
                        <p className="font-bold text-white text-sm">{t.name}</p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{t.description}</p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {t.tags.map(tag => (
                            <span key={tag} className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-md border border-indigo-500/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
              <button onClick={onClose} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Skip, start blank
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleApply}
                disabled={!selected || applying}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                {applying ? 'Applying...' : 'Use Template'}
                <ChevronRight size={15} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplateModal;
