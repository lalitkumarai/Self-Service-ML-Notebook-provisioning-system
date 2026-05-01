import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Terminal, CheckCircle, Cpu, Zap, BarChart3, Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';

const DEMO_STEPS = [
  { id: 1, label: 'Provisioning environment', duration: 1200 },
  { id: 2, label: 'Installing dependencies', duration: 1800 },
  { id: 3, label: 'Loading dataset (Iris)', duration: 800 },
  { id: 4, label: 'Training RandomForest classifier', duration: 2200 },
  { id: 5, label: 'Evaluating model performance', duration: 1000 },
  { id: 6, label: 'Generating visualizations', duration: 900 },
  { id: 7, label: 'Saving experiment results', duration: 600 },
];

const DEMO_LOGS = [
  '> Initializing ML runtime...',
  '> Python 3.11.4 | Kernel ready',
  '> Loading sklearn 1.3.0, pandas 2.0.3...',
  '> Dataset: Iris (150 samples, 4 features, 3 classes)',
  '> Train/test split: 80/20',
  '> Training RandomForestClassifier(n_estimators=100)',
  '> Epoch 1/100... loss: 0.3421',
  '> Epoch 25/100... loss: 0.1823',
  '> Epoch 50/100... loss: 0.0942',
  '> Epoch 75/100... loss: 0.0634',
  '> Epoch 100/100... loss: 0.0512',
  '> Test Accuracy: 97.33%',
  '> F1 Score (weighted): 0.9731',
  '> Confusion matrix generated ✓',
  '> Feature importance plot saved ✓',
  '> ✅ Demo completed successfully!',
];

const DemoScreen = () => {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [logIdx, setLogIdx] = useState(0);
  const [results, setResults] = useState(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const runDemo = async () => {
    setRunning(true);
    setDone(false);
    setCurrentStep(0);
    setLogs([]);
    setLogIdx(0);
    setResults(null);

    // Stream logs
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < DEMO_LOGS.length) {
        setLogs(prev => [...prev, DEMO_LOGS[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 400);

    // Progress through steps
    let stepIdx = 0;
    const runStep = () => {
      if (stepIdx >= DEMO_STEPS.length) {
        clearInterval(logInterval);
        setRunning(false);
        setDone(true);
        setCurrentStep(-1);
        setResults({
          accuracy: 97.33,
          f1Score: 97.31,
          trainingTime: 8.2,
          samples: 150,
        });
        return;
      }
      setCurrentStep(stepIdx);
      setTimeout(() => {
        stepIdx++;
        runStep();
      }, DEMO_STEPS[stepIdx].duration);
    };
    runStep();
  };

  const reset = () => {
    setRunning(false);
    setDone(false);
    setCurrentStep(-1);
    setLogs([]);
    setResults(null);
  };

  const progress = done ? 100 : currentStep >= 0 ? Math.round((currentStep / DEMO_STEPS.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Demo Mode</h1>
        <p className="text-sm text-slate-500 mt-1">Experience the full ML pipeline in one click — no setup required.</p>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f1117] via-[#111827] to-[#1a1040] rounded-3xl border border-white/10 p-8 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <Sparkles size={28} className="text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold">ML Platform Demo</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-md">
              Watch the system automatically provision a notebook, train a classifier on real data, and evaluate results — all in under 10 seconds.
            </p>
          </div>

          {!running && !done && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={runDemo}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-lg rounded-2xl shadow-2xl shadow-indigo-500/30 transition-all"
            >
              <Play size={20} fill="currentColor" /> Run Demo
            </motion.button>
          )}

          {(running || done) && (
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>{done ? 'Completed!' : DEMO_STEPS[currentStep]?.label || 'Starting...'}</span>
                <span className="font-bold text-indigo-400">{progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          )}

          {done && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-all border border-white/10"
            >
              <RefreshCw size={14} /> Run Again
            </motion.button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <p className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Cpu size={16} className="text-indigo-500" /> Pipeline Steps
          </p>
          {DEMO_STEPS.map((step, i) => {
            const isActive = currentStep === i;
            const isCompleted = done || currentStep > i;
            return (
              <motion.div
                key={step.id}
                animate={{ opacity: (running || done) ? 1 : 0.4 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-indigo-50 border border-indigo-100' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted ? 'bg-emerald-500' : isActive ? 'bg-indigo-500' : 'bg-slate-100'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={12} className="text-white" />
                  ) : isActive ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <RefreshCw size={10} className="text-white" />
                    </motion.div>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400">{i + 1}</span>
                  )}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-indigo-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Terminal Log */}
        <div className="bg-[#0f1117] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
            <Terminal size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Output</span>
            <div className="ml-auto flex gap-1.5">
              {['bg-red-500', 'bg-yellow-500', 'bg-green-500'].map(c => (
                <div key={c} className={`w-2.5 h-2.5 rounded-full ${c} opacity-60`} />
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-400 space-y-1 min-h-[280px] max-h-72">
            {logs.length === 0 && !running && (
              <p className="text-slate-600 italic">Click "Run Demo" to start...</p>
            )}
            <AnimatePresence initial={false}>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={log.includes('✅') || log.includes('97') ? 'text-emerald-400 font-bold' : log.includes('>') ? 'text-indigo-300' : 'text-slate-400'}
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: 'Accuracy', value: `${results.accuracy}%`, icon: BarChart3, color: 'emerald', glow: 'rgba(16,185,129,0.15)' },
              { label: 'F1 Score', value: `${results.f1Score}%`, icon: Zap, color: 'indigo', glow: 'rgba(99,102,241,0.15)' },
              { label: 'Training Time', value: `${results.trainingTime}s`, icon: RefreshCw, color: 'violet', glow: 'rgba(139,92,246,0.15)' },
              { label: 'Samples', value: results.samples.toString(), icon: Cpu, color: 'blue', glow: 'rgba(59,130,246,0.15)' },
            ].map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 text-center"
                style={{ boxShadow: `0 0 30px ${r.glow}` }}
              >
                <r.icon size={20} className={`text-${r.color}-500 mx-auto mb-2`} />
                <p className={`text-2xl font-extrabold text-${r.color}-600`}>{r.value}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">{r.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoScreen;
