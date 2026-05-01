import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Eye, Trash2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

const DatasetUploadScreen = () => {
  const [datasets, setDatasets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null); // { dataset }
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchDatasets = useCallback(async () => {
    try {
      const r = await axios.get('/api/datasets');
      setDatasets(r.data.datasets || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchDatasets(); }, [fetchDatasets]);

  const handleUpload = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    setUploadProgress(0);
    const form = new FormData();
    form.append('file', file);
    form.append('name', file.name.replace(/\.[^/.]+$/, ''));
    try {
      await axios.post('/api/datasets/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded / p.total) * 100)),
      });
      await fetchDatasets();
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/datasets/${id}`);
      setDatasets(prev => prev.filter(d => d._id !== id));
    } catch (e) { console.error(e); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dataset Manager</h1>
        <p className="text-sm text-slate-500 mt-1">Upload CSV files and link them to your notebooks.</p>
      </div>

      {/* Drop Zone */}
      <motion.div
        animate={{ scale: dragOver ? 1.01 : 1 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer ${
          dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
        }`}
        onClick={() => document.getElementById('file-upload-input').click()}
      >
        <input
          id="file-upload-input"
          type="file"
          accept=".csv,.json,.txt"
          className="hidden"
          onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? 'bg-indigo-100' : 'bg-slate-100'}`}>
            <Upload size={24} className={dragOver ? 'text-indigo-500' : 'text-slate-400'} />
          </div>
          <div>
            <p className="font-semibold text-slate-700">Drop your CSV here, or <span className="text-indigo-600">browse</span></p>
            <p className="text-sm text-slate-400 mt-1">Supports CSV, JSON, TXT — max 50MB</p>
          </div>
          {uploading && (
            <div className="w-full max-w-xs">
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{uploadProgress}% uploaded...</p>
            </div>
          )}
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Dataset List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-slate-400" />
            <span className="font-bold text-slate-800">Your Datasets</span>
            <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{datasets.length}</span>
          </div>
        </div>

        {datasets.length === 0 ? (
          <div className="py-12 text-center">
            <FileText size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No datasets uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            <AnimatePresence>
              {datasets.map((ds) => (
                <motion.div
                  key={ds._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{ds.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatBytes(ds.size)} · {ds.rows.toLocaleString()} rows · {ds.columns} cols
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPreview(ds)}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      title="Preview"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(ds._id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900">{preview.name}</h3>
                  <p className="text-xs text-slate-400">{preview.rows} rows · {preview.columns} columns · {formatBytes(preview.size)}</p>
                </div>
                <button onClick={() => setPreview(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
                  <X size={16} />
                </button>
              </div>
              <div className="overflow-auto max-h-72">
                {preview.headers?.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        {preview.headers.map(h => (
                          <th key={h} className="px-4 py-2 text-left text-xs font-bold text-slate-500 border-b border-slate-100 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.preview.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 border-b border-slate-50">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-2 text-slate-700 whitespace-nowrap text-xs">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">No preview available</div>
                )}
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                <p className="text-xs font-mono text-slate-500">
                  Load path: <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">/data/{preview.filename}</code>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatasetUploadScreen;
