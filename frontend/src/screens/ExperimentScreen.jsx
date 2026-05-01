import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Plus, Trash2, TrendingUp, Clock, Target,
  ChevronDown, ChevronUp, BarChart3, X, CheckCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import axios from 'axios';

const FRAMEWORKS = ['PyTorch', 'TensorFlow', 'Scikit-learn', 'XGBoost', 'Custom'];

const ExperimentScreen = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState([]); // ids for comparison
  const [form, setForm] = useState({
    name: '', description: '', framework: 'PyTorch',
    parameters: { learningRate: '', epochs: '', batchSize: '', optimizer: 'Adam' },
    metrics: { accuracy: '', loss: '', valAccuracy: '', valLoss: '', f1Score: '' },
    trainingTime: '', tags: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchExperiments = useCallback(async () => {
    try {
      const r = await axios.get('/api/experiments');
      setExperiments(r.data.experiments || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchExperiments(); }, [fetchExperiments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        parameters: {
          ...form.parameters,
          learningRate: Number(form.parameters.learningRate),
          epochs: Number(form.parameters.epochs),
          batchSize: Number(form.parameters.batchSize),
        },
        metrics: {
          accuracy: Number(form.metrics.accuracy) || undefined,
          loss: Number(form.metrics.loss) || undefined,
          valAccuracy: Number(form.metrics.valAccuracy) || undefined,
          valLoss: Number(form.metrics.valLoss) || undefined,
          f1Score: Number(form.metrics.f1Score) || undefined,
        },
        trainingTime: Number(form.trainingTime),
      };
      await axios.post('/api/experiments', payload);
      await fetchExperiments();
      setShowForm(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/experiments/${id}`);
    setExperiments(prev => prev.filter(e => e._id !== id));
    setSelected(prev => prev.filter(s => s !== id));
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev.slice(-2), id]);
  };

  const comparedExps = experiments.filter(e => selected.includes(e._id));
  const chartData = experiments.slice(0, 10).map((e, i) => ({
    name: e.name.substring(0, 12),
    accuracy: (e.metrics?.accuracy || 0) * 100,
    loss: e.metrics?.loss || 0,
    f1: (e.metrics?.f1Score || 0) * 100,
  })).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Experiment Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Log, compare, and analyze your ML experiments.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={15} /> Log Experiment
        </motion.button>
      </div>

      {/* Stats Row */}
      {experiments.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Runs', value: experiments.length, icon: FlaskConical, color: 'indigo' },
            {
              label: 'Best Accuracy',
              value: `${(Math.max(...experiments.map(e => e.metrics?.accuracy || 0)) * 100).toFixed(1)}%`,
              icon: Target, color: 'emerald'
            },
            {
              label: 'Avg. Training Time',
              value: `${(experiments.reduce((s, e) => s + (e.trainingTime || 0), 0) / experiments.length).toFixed(0)}s`,
              icon: Clock, color: 'violet'
            },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center`}>
                <s.icon size={18} className={`text-${s.color}-500`} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">{s.label}</p>
                <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-500" /> Accuracy Trend
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
              <RTooltip formatter={(v, n) => [`${v.toFixed(1)}%`, n]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} name="Accuracy" />
              <Line type="monotone" dataKey="f1" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} name="F1 Score" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Comparison Panel */}
      {selected.length >= 2 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
          <p className="font-bold text-indigo-800 mb-3">Comparing {selected.length} experiments</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {comparedExps.map(e => (
              <div key={e._id} className="bg-white rounded-xl p-4 border border-indigo-100">
                <p className="font-bold text-slate-800">{e.name}</p>
                <p className="text-xs text-indigo-500 font-semibold">{e.framework}</p>
                <div className="mt-3 space-y-1">
                  {[
                    ['Accuracy', e.metrics?.accuracy != null ? `${(e.metrics.accuracy * 100).toFixed(2)}%` : '—'],
                    ['Loss', e.metrics?.loss?.toFixed(4) ?? '—'],
                    ['F1 Score', e.metrics?.f1Score != null ? `${(e.metrics.f1Score * 100).toFixed(2)}%` : '—'],
                    ['Epochs', e.parameters?.epochs ?? '—'],
                    ['LR', e.parameters?.learningRate ?? '—'],
                    ['Train Time', e.trainingTime ? `${e.trainingTime}s` : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-400">{k}</span>
                      <span className="font-bold text-slate-700">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Experiment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-bold text-slate-800">All Experiments</span>
          {selected.length > 0 && (
            <span className="text-xs text-indigo-600 font-bold">{selected.length} selected for comparison</span>
          )}
        </div>
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading experiments...</div>
        ) : experiments.length === 0 ? (
          <div className="py-12 text-center">
            <FlaskConical size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No experiments yet. Log your first run!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['', 'Name', 'Framework', 'Accuracy', 'Loss', 'F1', 'Time', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {experiments.map((exp) => (
                    <motion.tr
                      key={exp._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${selected.includes(exp._id) ? 'bg-indigo-50/60' : ''}`}
                      onClick={() => toggleSelect(exp._id)}
                    >
                      <td className="px-4 py-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selected.includes(exp._id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>
                          {selected.includes(exp._id) && <CheckCircle size={10} className="text-white" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{exp.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-violet-50 text-violet-600 font-bold px-2 py-0.5 rounded-lg">{exp.framework}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        {exp.metrics?.accuracy != null ? `${(exp.metrics.accuracy * 100).toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{exp.metrics?.loss?.toFixed(4) ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {exp.metrics?.f1Score != null ? `${(exp.metrics.f1Score * 100).toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{exp.trainingTime ? `${exp.trainingTime}s` : '—'}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(exp.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(exp._id); }}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Experiment Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 20 }}
              className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Log New Experiment</h3>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Experiment Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. ResNet50 v2" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Framework</label>
                    <select value={form.framework} onChange={e => setForm(f => ({ ...f, framework: e.target.value }))}
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {FRAMEWORKS.map(fw => <option key={fw}>{fw}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Training Time (s)</label>
                    <input type="number" value={form.trainingTime} onChange={e => setForm(f => ({ ...f, trainingTime: e.target.value }))}
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. 120" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Parameters</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[['Learning Rate', 'learningRate', '0.001'], ['Epochs', 'epochs', '50'], ['Batch Size', 'batchSize', '32'], ['Optimizer', 'optimizer', 'Adam']].map(([label, key, ph]) => (
                      <div key={key}>
                        <label className="text-[10px] text-slate-400 font-semibold">{label}</label>
                        <input value={form.parameters[key]} onChange={e => setForm(f => ({ ...f, parameters: { ...f.parameters, [key]: e.target.value } }))}
                          className="w-full mt-0.5 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder={ph} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Metrics</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[['Accuracy', 'accuracy', '0.94'], ['Loss', 'loss', '0.12'], ['Val Acc', 'valAccuracy', '0.91'], ['Val Loss', 'valLoss', '0.18'], ['F1 Score', 'f1Score', '0.93']].map(([label, key, ph]) => (
                      <div key={key}>
                        <label className="text-[10px] text-slate-400 font-semibold">{label}</label>
                        <input type="number" step="any" value={form.metrics[key]} onChange={e => setForm(f => ({ ...f, metrics: { ...f.metrics, [key]: e.target.value } }))}
                          className="w-full mt-0.5 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder={ph} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="baseline, production, v2" />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-sm">
                    {saving ? 'Saving...' : 'Log Experiment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExperimentScreen;
