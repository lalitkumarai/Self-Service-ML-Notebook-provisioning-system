import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import {
  X, Cpu, Database, HardDrive, Zap, GitBranch, Info,
  ChevronRight, Server, Terminal, Code, Check,
  FlaskConical, Brain, Package, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Environment Definitions (SageMaker / Colab style) ──────────────────────
const ENVIRONMENTS = [
  {
    id: 'basic',
    label: 'Basic Python',
    badge: 'Lightweight',
    badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: '🐍',
    gradient: 'from-slate-500/10 to-slate-400/5',
    border: 'border-slate-200',
    activeBorder: 'border-slate-500',
    activeGlow: 'shadow-[0_0_20px_rgba(100,116,139,0.15)]',
    description: 'Minimal Python kernel. Great for scripting and data structures.',
    preinstalled: ['Python stdlib', 'pip', 'ipykernel'],
    imageKey: 'basic',
    gpuRequired: false,
  },
  {
    id: 'ml',
    label: 'ML Environment',
    badge: 'Recommended',
    badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    icon: '🧠',
    gradient: 'from-indigo-500/10 to-purple-500/5',
    border: 'border-indigo-100',
    activeBorder: 'border-indigo-500',
    activeGlow: 'shadow-[0_0_24px_rgba(99,102,241,0.2)]',
    description: 'Full ML stack. Pre-installed with all data science libraries.',
    preinstalled: ['numpy', 'pandas', 'scikit-learn', 'matplotlib', 'seaborn'],
    imageKey: 'ml',
    gpuRequired: false,
  },
  {
    id: 'gpu_pytorch',
    label: 'GPU · PyTorch',
    badge: 'CUDA 12.1',
    badgeColor: 'bg-orange-50 text-orange-600 border-orange-200',
    icon: '🔥',
    gradient: 'from-orange-500/10 to-red-500/5',
    border: 'border-orange-100',
    activeBorder: 'border-orange-500',
    activeGlow: 'shadow-[0_0_24px_rgba(249,115,22,0.2)]',
    description: 'CUDA 12.1 with PyTorch 2.3 for deep learning & GPU-accelerated training.',
    preinstalled: ['torch 2.3', 'torchvision', 'numpy', 'pandas', 'CUDA 12.1'],
    imageKey: 'gpu_pytorch',
    gpuRequired: true,
  },
  {
    id: 'gpu_tensorflow',
    label: 'GPU · TensorFlow',
    badge: 'CUDA 12.3',
    badgeColor: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: '⚡',
    gradient: 'from-yellow-500/10 to-amber-500/5',
    border: 'border-yellow-100',
    activeBorder: 'border-yellow-500',
    activeGlow: 'shadow-[0_0_24px_rgba(234,179,8,0.2)]',
    description: 'CUDA 12.3 with TensorFlow 2.16 + Keras 3. Perfect for production models.',
    preinstalled: ['tensorflow 2.16', 'keras 3.3', 'numpy', 'pandas', 'CUDA 12.3'],
    imageKey: 'gpu_tensorflow',
    gpuRequired: true,
  },
];



// ─── Python Versions ─────────────────────────────────────────────────────────
const PYTHON_VERSIONS = [
  { id: '3.11', label: 'Python 3.11', badge: 'Latest', color: 'indigo' },
  { id: '3.10', label: 'Python 3.10', badge: 'Stable', color: 'slate' },
];

// ─── Resource blueprints ──────────────────────────────────────────────────────
const BLUEPRINTS = [
  { id: 'minimal',      label: 'Starter',   cpu: 0.5, ram: 1,  storage: 2,  gpu: false },
  { id: 'standard',     label: 'Standard',  cpu: 2,   ram: 4,  storage: 10, gpu: false },
  { id: 'performance',  label: 'Pro',       cpu: 4,   ram: 8,  storage: 20, gpu: false },
  { id: 'gpu-power',    label: 'GPU Power', cpu: 4,   ram: 16, storage: 50, gpu: true  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const ResourceSlider = ({ label, icon: Icon, value, min, max, step, unit, onChange }) => (
  <div className="space-y-2.5">
    <div className="flex justify-between items-center">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        <Icon size={13} className="text-slate-400" /> {label}
      </span>
      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
        {value} {unit}
      </span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-indigo-600"
      style={{ background: `linear-gradient(to right, #6366f1 ${((value - min) / (max - min)) * 100}%, #e2e8f0 0%)` }}
    />
    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
      <span>{min} {unit}</span><span>{max} {unit}</span>
    </div>
  </div>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────
const CreateNotebookModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep]                     = useState(1);
  const [selectedEnv, setSelectedEnv]       = useState('ml');
  const [selectedPython, setSelectedPython] = useState('3.11');
  const [selectedBlueprint, setSelectedBlueprint] = useState('standard');
  const [formData, setFormData] = useState({ name: '', cpu: 2, ram: 4, storage: 10, gpu: false, gitRepo: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Reset on open
  useEffect(() => {
    if (isOpen) { setStep(1); setSelectedEnv('ml-standard'); setSelectedPython('3.11'); setSelectedBlueprint('standard'); setFormData({ name: '', cpu: 2, ram: 4, storage: 10, gpu: false, gitRepo: '' }); setError(''); }
  }, [isOpen]);

  const applyBlueprint = (bp) => {
    setSelectedBlueprint(bp.id);
    setFormData(p => ({ ...p, cpu: bp.cpu, ram: bp.ram, storage: bp.storage, gpu: bp.gpu }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) { setError('Notebook name is required'); return; }
    if (formData.gitRepo && !formData.gitRepo.startsWith('https://')) { setError('Git repo must start with https://'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/notebook/create', {
        name:          formData.name,
        cpu:           `${Math.round(formData.cpu * 1000)}m`,
        ram:           `${formData.ram * 1024}Mi`,
        storage:       `${formData.storage}Gi`,
        gpu:           activeEnv?.gpuRequired || formData.gpu,
        gitRepo:       formData.gitRepo,
        environment:   activeEnv?.gpuRequired
                         ? selectedEnv                   // e.g. gpu_pytorch
                         : `${selectedEnv}-py${selectedPython.replace('.', '')}`,  // e.g. ml-py311
        pythonVersion: selectedPython,
      });

      // ── AUTO-OPEN NOTEBOOK IN NEW TAB ────────────────────────────────
      if (data?.accessURL) {
        window.open(data.accessURL, '_blank', 'noopener,noreferrer');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create notebook');
    } finally { setLoading(false); }
  };

  const activeEnv   = ENVIRONMENTS.find(e => e.id === selectedEnv);
  const costPerHour = (formData.cpu * 0.04 + formData.ram * 0.02 + formData.storage * 0.001 + (formData.gpu ? 0.5 : 0)).toFixed(3);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl p-0 overflow-hidden bg-white">
      <div className="flex flex-col h-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Server size={15} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">New Notebook</h3>
              <p className="text-xs text-slate-400">Configure your environment and resources</p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{step > s ? <Check size={11} /> : s}</div>
                {s < 2 && <div className={`w-8 h-0.5 ${step > 1 ? 'bg-indigo-600' : 'bg-slate-200'} transition-all`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Main Content ── */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">

              {/* ═══════════════ STEP 1: Environment Selector ══════════════════ */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-6">

                  {/* Environment Cards */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Choose Runtime Environment</p>
                    <div className="grid grid-cols-3 gap-3">
                      {ENVIRONMENTS.map(env => (
                        <motion.button
                          key={env.id}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedEnv(env.id);
                            // Auto-enable GPU toggle for GPU environments
                            if (env.gpuRequired) setFormData(p => ({ ...p, gpu: true }));
                            else setFormData(p => ({ ...p, gpu: false }));
                          }}
                          className={clsx(
                            'relative text-left p-4 rounded-2xl border-2 transition-all duration-200',
                            `bg-gradient-to-br ${env.gradient}`,
                            selectedEnv === env.id
                              ? `${env.activeBorder} ${env.activeGlow}`
                              : `${env.border} hover:border-slate-300`
                          )}
                        >
                          {selectedEnv === env.id && (
                            <motion.div layoutId="env-check" className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                              <Check size={11} className="text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                          <span className="text-2xl block mb-2">{env.icon}</span>
                          <p className="font-bold text-slate-800 text-sm">{env.label}</p>
                          <span className={clsx('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border mt-1 inline-block', env.badgeColor)}>
                            {env.badge}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{env.description}</p>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {env.preinstalled.map(pkg => (
                              <span key={pkg} className="text-[9px] bg-white/60 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md font-mono">
                                {pkg}
                              </span>
                            ))}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Python Version */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Python Version</p>
                    <div className="flex gap-2">
                      {PYTHON_VERSIONS.map(v => (
                        <motion.button
                          key={v.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPython(v.id)}
                          className={clsx(
                            'flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all',
                            selectedPython === v.id
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                          )}
                        >
                          <span className="font-mono text-base">🐍</span>
                          <span>{v.label}</span>
                          <span className={clsx(
                            'text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md',
                            v.id === '3.11' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                          )}>{v.badge}</span>
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      <span className="font-semibold text-slate-500">Image tag:</span>{' '}
                      <code className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                        {activeEnv?.imageKey || 'ml-notebook'}:py{selectedPython.replace('.', '')}
                      </code>
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                      Configure Resources <ChevronRight size={15} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ═══════════════ STEP 2: Configuration ════════════════════════ */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-6">

                  {/* Selected environment reminder */}
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <span className="text-xl">{activeEnv?.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{activeEnv?.label}</p>
                      <p className="text-[11px] text-indigo-500 font-mono">Python {selectedPython} · {activeEnv?.imageKey}:py{selectedPython.replace('.', '')}</p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold">Change</button>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                      <Info size={14} />{error}
                    </div>
                  )}

                  {/* Notebook Name */}
                  <div>
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Notebook Name *</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., ResNet50 Training Experiment"
                      className="w-full"
                    />
                  </div>

                  {/* Resource Blueprint quick-select */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quick Config</p>
                    <div className="grid grid-cols-4 gap-2">
                      {BLUEPRINTS.map(bp => (
                        <button key={bp.id} onClick={() => applyBlueprint(bp)}
                          className={clsx(
                            'text-center px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all',
                            selectedBlueprint === bp.id
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          )}>
                          <p>{bp.label}</p>
                          <p className="text-[9px] font-normal text-slate-400 mt-0.5">{bp.cpu}vCPU · {bp.ram}GB</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resource Sliders */}
                  <div className="space-y-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <ResourceSlider label="CPU" icon={Cpu} value={formData.cpu} min={0.5} max={8} step={0.5} unit="vCPU" onChange={v => setFormData(p => ({ ...p, cpu: v }))} />
                    <ResourceSlider label="Memory" icon={Database} value={formData.ram} min={1} max={32} step={1} unit="GB" onChange={v => setFormData(p => ({ ...p, ram: v }))} />
                    <ResourceSlider label="Storage" icon={HardDrive} value={formData.storage} min={1} max={100} step={1} unit="GB" onChange={v => setFormData(p => ({ ...p, storage: v }))} />
                  </div>

                  {/* GPU Toggle */}
                  <div className={clsx('flex items-center justify-between p-4 rounded-xl border-2 transition-all', formData.gpu ? 'border-purple-400 bg-purple-50' : 'border-slate-200 bg-white')}>
                    <div className="flex items-center gap-3">
                      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', formData.gpu ? 'bg-purple-500' : 'bg-slate-100')}>
                        <Zap size={16} className={formData.gpu ? 'text-white' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">GPU Acceleration</p>
                        <p className="text-xs text-slate-400">NVIDIA GPU for deep learning</p>
                      </div>
                    </div>
                    <Switch checked={formData.gpu} onChange={v => setFormData(p => ({ ...p, gpu: v }))}
                      className={clsx('relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none', formData.gpu ? 'bg-purple-600' : 'bg-slate-200')}>
                      <span className={clsx('pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out', formData.gpu ? 'translate-x-5' : 'translate-x-0')} />
                    </Switch>
                  </div>

                  {/* Git Repo */}
                  <div>
                    <Label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      <GitBranch size={12} /> Git Repository (Optional)
                    </Label>
                    <Input type="text" value={formData.gitRepo}
                      onChange={e => setFormData({ ...formData, gitRepo: e.target.value })}
                      placeholder="https://github.com/username/repo.git"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(1)} className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                      ← Back
                    </button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleSubmit} disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Provisioning...</>
                      ) : (
                        <><Server size={15} /> Launch Notebook</>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right Panel: Live Summary ── */}
          <div className="w-64 border-l border-slate-100 bg-slate-50/60 p-5 flex flex-col gap-5 overflow-y-auto">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Live Summary</p>

            {/* Environment */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Environment</p>
              <div className="bg-white rounded-xl border border-slate-100 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Runtime</span><span className="font-bold text-slate-700">{activeEnv?.label}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Python</span><span className="font-bold text-slate-700">{selectedPython}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Image</span>
                  <span className="font-mono text-[10px] text-indigo-600">{activeEnv?.imageKey}:py{selectedPython.replace('.','')}</span>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Resources</p>
              <div className="bg-white rounded-xl border border-slate-100 p-3 space-y-1.5 text-xs">
                {[
                  ['CPU', `${formData.cpu} vCPU`],
                  ['RAM', `${formData.ram} GB`],
                  ['Storage', `${formData.storage} GB`],
                  ['GPU', formData.gpu ? '✅ Enabled' : 'None'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-400">{k}</span>
                    <span className={clsx('font-bold', k === 'GPU' && formData.gpu ? 'text-purple-600' : 'text-slate-700')}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost estimate */}
            <div className="mt-auto">
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Estimated Cost</p>
                <p className="text-3xl font-extrabold text-indigo-700 mt-1">${costPerHour}</p>
                <p className="text-[10px] text-indigo-400 font-medium">per hour</p>
                <div className="mt-3 pt-3 border-t border-indigo-100 text-[10px] text-indigo-400 space-y-0.5">
                  <p>{formData.cpu} vCPU × $0.04 = ${(formData.cpu * 0.04).toFixed(3)}</p>
                  <p>{formData.ram} GB RAM × $0.02 = ${(formData.ram * 0.02).toFixed(3)}</p>
                  {formData.gpu && <p className="text-purple-500 font-bold">GPU = $0.500</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateNotebookModal;