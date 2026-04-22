import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import { 
  Play, 
  Plus, 
  Save, 
  Trash2, 
  RotateCcw,
  ChevronLeft,
  Settings,
  Terminal,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import CodeCell from '../components/notebook/CodeCell';
import AIAssistantPanel from '../components/notebook/AIAssistantPanel';
import ResourceMonitor from '../components/notebook/ResourceMonitor';
import Toast from '../components/Toast';

const NotebookEditorScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notebookName, setNotebookName] = useState('Untitled Notebook');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [cells, setCells] = useState([
    { 
      id: 'cell-1', 
      type: 'code', 
      content: `import time
import random
import io
import base64
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
import matplotlib.pyplot as plt

print("Libraries imported successfully!")`, 
      output: [] 
    },
    { 
      id: 'cell-2', 
      type: 'code', 
      content: `# Generate synthetic dataset
print("Loading dataset...")
time.sleep(1) # Simulate I/O

np.random.seed(42)
X = np.random.rand(100, 1) * 10
y = 2.5 * X + np.random.randn(100, 1) * 2

df = pd.DataFrame(np.hstack([X, y]), columns=['Feature', 'Target'])
print(f"Dataset loaded: {len(df)} samples")
print(df.head())`, 
      output: [] 
    },
    { 
      id: 'cell-3', 
      type: 'code', 
      content: `# Data Preprocessing
print("Preprocessing data...")
time.sleep(0.5)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"Training set: {len(X_train)} samples")
print(f"Test set: {len(X_test)} samples")`, 
      output: [] 
    },
    { 
      id: 'cell-4', 
      type: 'code', 
      content: `# Train Model
print("Training Linear Regression model...")
model = LinearRegression()

# Simulate training progress
for i in range(5):
    print(f"Epoch {i+1}/5 - loss: {random.random():.4f}")
    time.sleep(0.5)

model.fit(X_train, y_train)
print("Training completed!")`, 
      output: [] 
    },
    { 
      id: 'cell-5', 
      type: 'code', 
      content: `# Evaluate Model
print("Evaluating model...")
y_pred = model.predict(X_test)
score = r2_score(y_test, y_pred)
print(f"R² Score: {score:.4f}")`, 
      output: [] 
    },
    { 
      id: 'cell-6', 
      type: 'code', 
      content: `# Visualization
print("Generating visualization...")
plt.figure(figsize=(10, 6))
plt.scatter(X_test, y_test, color='black', label='Actual Data')
plt.plot(X_test, y_pred, color='blue', linewidth=3, label='Predictions')
plt.title('Linear Regression Results')
plt.xlabel('Feature')
plt.ylabel('Target')
plt.legend()
plt.grid(True)

# Save to base64 for display
buf = io.BytesIO()
plt.savefig(buf, format='png')
buf.seek(0)
img_str = base64.b64encode(buf.read()).decode('utf-8')
print(f"__IMG_START__{img_str}__IMG_END__")
plt.close()
print("Plot generated successfully.")`, 
      output: [] 
    }
  ]);
  const [activeCellId, setActiveCellId] = useState('cell-1');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [executionProgress, setExecutionProgress] = useState(null); // { total, current, isRunning: boolean }
  const pendingExecutions = useRef({});

  // Load notebook content
  useEffect(() => {
    const fetchNotebook = async () => {
        try {
            const { data } = await axios.get(`/api/notebook/${id}/content`);

            if (data.cells && data.cells.length > 0) {
                setCells(data.cells);
                // Set active cell to the last one or the first one?
                // Let's set it to the first incomplete one or the last one
                const lastCell = data.cells[data.cells.length - 1];
                setActiveCellId(lastCell.id);
            }
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: 'Error loading notebook', type: 'error' });
        }
    };

    if (user) {
        fetchNotebook();
    }
  }, [id, user]);

  const saveNotebook = async () => {
    try {
        await axios.post(`/api/notebook/${id}/content`, { cells });
        setToast({ show: true, message: 'Notebook saved successfully!', type: 'success' });
    } catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || 'Error saving notebook';
        setToast({ show: true, message: msg, type: 'error' });
    }
  };

  // Initialize Socket connection
  useEffect(() => {
    if (!user) return;

    // In a real app, this URL would come from env or be dynamic based on the notebook's pod URL
    const socketUrl = import.meta.env.VITE_API_URL || '';
    const newSocket = io(socketUrl, {
        auth: {
            token: `Bearer ${user.token}`
        }
    }); 

    newSocket.on('connect', () => {
      console.log('Connected to kernel');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from kernel');
      setIsConnected(false);
    });

    newSocket.on('error', (err) => {
        setToast({ show: true, message: `Kernel Error: ${err}`, type: 'error' });
    });

    newSocket.on('kernel_restarted', (data) => {
        setToast({ show: true, message: data.message, type: 'success' });
    });

    setSocket(newSocket);

    return () => {
        newSocket.disconnect();
    };
  }, [user]);

  // Handle incoming output and status from kernel
  useEffect(() => {
    if (!socket) return;

    const handleOutput = (data) => {
       // data: { type: 'stdout' | 'stderr', data: string, cellId?: string }
       setCells(prevCells => prevCells.map(cell => {
         // If cellId is provided, match it. Otherwise match running cell (fallback)
         if ((data.cellId && cell.id === data.cellId) || (!data.cellId && cell.status === 'running')) {
            // For friendly error messages, check if it's a stderr with specific keywords
            let content = data.data;
            if (data.type === 'stderr') {
                // Formatting for common errors could be done here if needed
                // But the backend already formats the timeout/memory errors nicely
            }

            return {
                ...cell,
                output: [...cell.output, { type: data.type, content: content }]
            };
         }
         return cell;
       }));
    };

    const handleStatus = (data) => {
        // data: { status: 'completed' | 'failed' | 'running', cellId: string }
        const { status, cellId } = data;

        if (status === 'completed' || status === 'failed') {
             setCells(prev => prev.map(c => {
                 if (c.id === cellId) {
                     const executionTime = c.startTime ? Date.now() - c.startTime : undefined;
                     return { ...c, status: status, executionTime };
                 }
                 return c;
             }));

             // Resolve promise if exists
             if (pendingExecutions.current[cellId]) {
                 pendingExecutions.current[cellId]();
                 delete pendingExecutions.current[cellId];
             }
        } else if (status === 'running') {
             setCells(prev => prev.map(c => c.id === cellId ? { ...c, status: 'running' } : c));
        }
    };

    socket.on('output', handleOutput);
    socket.on('execution_status', handleStatus);

    return () => {
        socket.off('output', handleOutput);
        socket.off('execution_status', handleStatus);
    };
  }, [socket]);

  const runCell = async (cellId) => {
    if (!socket || !isConnected) {
        setToast({ show: true, message: 'Kernel not connected', type: 'error' });
        return;
    }

    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;

    return new Promise((resolve) => {
        const startTime = Date.now();
        
        // Register resolve callback
        pendingExecutions.current[cellId] = resolve;

        // Clear previous output and mark running
        setCells(prev => prev.map(c => 
            c.id === cellId 
            ? { ...c, output: [], status: 'running', startTime } 
            : c
        ));

        socket.emit('execute_code', { code: cell.content, cellId });
    });
  };

  const runAllCells = async () => {
      const codeCells = cells.filter(c => c.type === 'code');
      if (codeCells.length === 0) return;

      // Mark all as pending
      setCells(prev => prev.map(c => 
        c.type === 'code' ? { ...c, status: 'pending', output: [] } : c
      ));

      setExecutionProgress({ total: codeCells.length, current: 0, isRunning: true });

      for (let i = 0; i < codeCells.length; i++) {
          const cell = codeCells[i];
          setExecutionProgress(prev => ({ ...prev, current: i + 1 }));
          await runCell(cell.id);
      }

      setExecutionProgress(null);
  };

  const handleRestartKernel = () => {
      if (socket && isConnected) {
          socket.emit('restart_kernel');
          setToast({ show: true, message: 'Restarting kernel...', type: 'info' });
          // Reset all cell statuses
          setCells(prev => prev.map(c => ({ ...c, status: undefined })));
          setExecutionProgress(null);
      }
  };

  const addCell = (type = 'code') => {
    const newCell = {
        id: `cell-${Date.now()}`,
        type,
        content: '',
        output: []
    };
    setCells([...cells, newCell]);
    setActiveCellId(newCell.id);
  };

  const updateCellContent = (cellId, content) => {
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, content } : c));
  };

  const deleteCell = (cellId) => {
    if (cells.length === 1) return;
    setCells(cells.filter(c => c.id !== cellId));
  };

  const handleApplyCode = (newCode) => {
    if (activeCellId) {
        updateCellContent(activeCellId, newCode);
        setToast({ show: true, message: 'Code applied to cell!', type: 'success' });
    }
  };

  const activeCellContent = cells.find(c => c.id === activeCellId)?.content || '';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
            </Button>
            <div className="ml-4 flex items-center">
                <Terminal className="h-5 w-5 text-primary-600 mr-2" />
                <h1 className="text-lg font-semibold text-gray-900">{notebookName}</h1>
                <Badge variant={isConnected ? 'success' : 'warning'} className="ml-3">
                    {isConnected ? 'Kernel Ready' : 'Connecting...'}
                </Badge>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            {executionProgress && (
                <div className="flex flex-col w-40 mr-4">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-medium">
                        <span>Executing cell {executionProgress.current} of {executionProgress.total}</span>
                    </div>
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-primary-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${(executionProgress.current / executionProgress.total) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            )}
            <Button 
                variant={isAIPanelOpen ? "default" : "outline"} 
                size="sm" 
                onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
                className={isAIPanelOpen ? "bg-primary-600 text-white" : ""}
            >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
            </Button>
            <Button variant="outline" size="sm" onClick={handleRestartKernel} disabled={!isConnected} title="Restart Kernel">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
            </Button>
            <Button variant="outline" size="sm" onClick={runAllCells} disabled={!isConnected}>
                <Play className="h-4 w-4 mr-2" />
                Run All
            </Button>
            <Button variant="outline" size="sm" onClick={() => addCell('code')}>
                <Plus className="h-4 w-4 mr-2" />
                Code
            </Button>
            <Button variant="outline" size="sm" onClick={saveNotebook}>
                <Save className="h-4 w-4 mr-2" />
                Save
            </Button>
            <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-gray-500" />
            </Button>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {cells.map((cell, index) => (
                    <CodeCell
                        key={cell.id}
                        cell={cell}
                        isActive={activeCellId === cell.id}
                        onFocus={() => setActiveCellId(cell.id)}
                        onChange={(val) => updateCellContent(cell.id, val)}
                        onRun={() => runCell(cell.id)}
                        onDelete={() => deleteCell(cell.id)}
                    />
                ))}
                
                <div className="flex justify-center py-8 opacity-50 hover:opacity-100 transition-opacity">
                    <Button variant="ghost" onClick={() => addCell('code')} className="text-gray-500">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Code Cell
                    </Button>
                </div>
            </div>
        </div>
        
        <ResourceMonitor isConnected={isConnected} />

        <AIAssistantPanel 
            isOpen={isAIPanelOpen} 
            onClose={() => setIsAIPanelOpen(false)}
            activeCellContent={activeCellContent}
            onApplyCode={handleApplyCode}
        />
      </div>

      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
};

export default NotebookEditorScreen;
