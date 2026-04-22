import { Fragment, useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { 
  X, 
  Cpu, 
  Database, 
  HardDrive, 
  Zap, 
  GitBranch, 
  Info,
  ChevronRight,
  Server,
  Layers,
  Terminal,
  Code
} from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import { cn } from '../lib/utils';

const BLUEPRINTS = [
  { id: 'standard', name: 'Data Science Standard', icon: Database, cpu: 2, ram: 4, gpu: false, storage: 10, description: 'Balanced for general ML tasks (Pandas, Scikit-learn)' },
  { id: 'deep-learning', name: 'Deep Learning GPU', icon: Zap, cpu: 4, ram: 16, gpu: true, storage: 50, description: 'High performance for PyTorch/TensorFlow training' },
  { id: 'minimal', name: 'Minimal Python', icon: Terminal, cpu: 0.5, ram: 1, gpu: false, storage: 2, description: 'Lightweight for scripts and learning' },
];

const ResourceSlider = ({ label, icon: Icon, value, min, max, step, unit, onChange, description }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <Label className="flex items-center text-secondary-700">
        <Icon className="w-4 h-4 mr-2 text-secondary-400" />
        {label}
      </Label>
      <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
        {value} {unit}
      </span>
    </div>
    <div className="relative flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      />
    </div>
    <div className="flex justify-between text-xs text-secondary-400 px-1">
      <span>{min} {unit}</span>
      <span>{max} {unit}</span>
    </div>
    {description && <p className="text-xs text-secondary-500">{description}</p>}
  </div>
);

const CreateNotebookModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    cpu: 1,
    ram: 2,
    storage: 5,
    gpu: false,
    gitRepo: ''
  });
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        cpu: 1,
        ram: 2,
        storage: 5,
        gpu: false,
        gitRepo: ''
      });
      setSelectedBlueprint(null);
      setError('');
    }
  }, [isOpen]);

  const applyBlueprint = (blueprint) => {
      setSelectedBlueprint(blueprint.id);
      setFormData(prev => ({
          ...prev,
          cpu: blueprint.cpu,
          ram: blueprint.ram,
          storage: blueprint.storage,
          gpu: blueprint.gpu
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim()) {
        setError('Notebook name is required');
        setLoading(false);
        return;
    }

    if (formData.gitRepo && !formData.gitRepo.startsWith('https://')) {
        setError('Git repo URL must start with https://');
        setLoading(false);
        return;
    }

    try {
      // const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      // const config = {
      //   headers: {
      //     Authorization: `Bearer ${userInfo.token}`,
      //   },
      // };
      
      const payload = {
        name: formData.name,
        cpu: `${formData.cpu * 1000}m`, // Convert to millicores
        ram: `${formData.ram * 1024}Mi`, // Convert to Mi
        storage: `${formData.storage}Gi`,
        gpu: formData.gpu,
        gitRepo: formData.gitRepo
      };

      await axios.post('/api/notebook/create', payload);
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create notebook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl p-0"
    >
      <div className="flex h-full flex-col md:flex-row">
        {/* Left Side: Form */}
        <div className="flex-1 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Server className="w-5 h-5 mr-2 text-primary-600" />
              Create Notebook
            </h3>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 flex items-start">
              <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label>
                Notebook Name
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Deep Learning Experiment"
              />
            </div>

            {/* Blueprints Selection */}
            <div className="space-y-3">
               <Label>Select a Blueprint</Label>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {BLUEPRINTS.map((bp) => (
                      <div 
                        key={bp.id}
                        onClick={() => applyBlueprint(bp)}
                        className={clsx(
                            "cursor-pointer rounded-lg border p-3 flex flex-col items-center text-center transition-all",
                            selectedBlueprint === bp.id 
                                ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600" 
                                : "border-gray-200 hover:border-primary-200 hover:bg-gray-50"
                        )}
                      >
                          <bp.icon className={clsx(
                              "h-6 w-6 mb-2",
                              selectedBlueprint === bp.id ? "text-primary-600" : "text-gray-400"
                          )} />
                          <span className="text-xs font-semibold text-gray-900">{bp.name}</span>
                          <span className="text-[10px] text-gray-500 mt-1 line-clamp-2">{bp.description}</span>
                      </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6 pt-2">
              <ResourceSlider
                label="CPU Cores"
                icon={Cpu}
                value={formData.cpu}
                min={0.5}
                max={4}
                step={0.5}
                unit="vCPU"
                onChange={(val) => setFormData({ ...formData, cpu: val })}
                description="Allocated processing power"
              />

              <ResourceSlider
                label="Memory (RAM)"
                icon={Database}
                value={formData.ram}
                min={1}
                max={16}
                step={1}
                unit="GB"
                onChange={(val) => setFormData({ ...formData, ram: val })}
                description="Working memory for your kernels"
              />
              
              <ResourceSlider
                label="Persistent Storage"
                icon={HardDrive}
                value={formData.storage}
                min={1}
                max={50}
                step={1}
                unit="GB"
                onChange={(val) => setFormData({ ...formData, storage: val })}
                description="Disk space for datasets and models"
              />
            </div>

            <div className="pt-4 flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-100">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${formData.gpu ? 'bg-purple-100 text-purple-600' : 'bg-secondary-200 text-secondary-500'}`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <span className="block text-sm font-medium text-secondary-900">Enable GPU Acceleration</span>
                  <span className="block text-xs text-secondary-500">For intensive model training</span>
                </div>
              </div>
              <Switch
                checked={formData.gpu}
                onChange={(val) => setFormData({ ...formData, gpu: val })}
                className={clsx(
                  formData.gpu ? 'bg-purple-600' : 'bg-secondary-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                )}
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    formData.gpu ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            </div>

            {/* Advanced Options Toggle could go here */}
            <div className="space-y-2">
               <Label className="flex items-center">
                  <GitBranch className="w-4 h-4 mr-1 text-secondary-400" />
                  Git Repository (Optional)
               </Label>
               <Input
                  type="text"
                  value={formData.gitRepo}
                  onChange={(e) => setFormData({ ...formData, gitRepo: e.target.value })}
                  placeholder="https://github.com/username/repo.git"
               />
            </div>
          </form>
        </div>

        {/* Right Side: Summary */}
        <div className="bg-secondary-50 p-6 md:p-8 border-l border-secondary-100 w-full md:w-72 flex flex-col">
          <h4 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider mb-6">
            Configuration Summary
          </h4>

          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary-500">Compute</span>
                <span className="font-medium text-secondary-900">{formData.cpu} vCPU</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary-500">Memory</span>
                <span className="font-medium text-secondary-900">{formData.ram} GB</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary-500">Storage</span>
                <span className="font-medium text-secondary-900">{formData.storage} GB</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary-500">Accelerator</span>
                <span className={`font-medium ${formData.gpu ? 'text-purple-600' : 'text-secondary-400'}`}>
                  {formData.gpu ? 'NVIDIA GPU' : 'None'}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-secondary-200">
              <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                  <p className="text-xs text-blue-700 font-medium mb-1">Estimated Cost</p>
                  <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-blue-900">
                        ${(formData.cpu * 0.04 + formData.ram * 0.02 + formData.storage * 0.001 + (formData.gpu ? 0.5 : 0)).toFixed(3)}
                      </span>
                      <span className="text-blue-600 text-xs ml-1">/hour</span>
                  </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              isLoading={loading}
            >
              Create Notebook
            </Button>
            <Button
              className="w-full"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateNotebookModal;