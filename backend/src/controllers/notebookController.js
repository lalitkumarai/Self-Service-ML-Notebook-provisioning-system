const Notebook = require('../models/Notebook');
const { k8sAppsApi, k8sApi } = require('../config/k8s');
const fs = require('fs');
const path = require('path');

// Helper to parse CPU string to float
const parseCpu = (cpuStr) => {
    if (cpuStr.endsWith('m')) return parseInt(cpuStr) / 1000;
    return parseFloat(cpuStr);
};

// Helper to parse Memory string to MB
const parseMemory = (memStr) => {
    if (memStr.endsWith('Gi')) return parseInt(memStr) * 1024;
    if (memStr.endsWith('Mi')) return parseInt(memStr);
    return parseInt(memStr);
};

// Helper to create K8s resources
const provisionK8sResources = async (podName, pvcName, namespace, cpu, memory, storage, gpu, gitRepo) => {
    // 1. Create PVC
    const pvcManifest = {
        apiVersion: 'v1',
        kind: 'PersistentVolumeClaim',
        metadata: {
            name: pvcName,
            namespace: namespace,
        },
        spec: {
            accessModes: ['ReadWriteOnce'],
            resources: {
                requests: {
                    storage: storage || '1Gi',
                },
            },
        },
    };

    try {
        await k8sApi.readNamespacedPersistentVolumeClaim(pvcName, namespace);
    } catch (e) {
        await k8sApi.createNamespacedPersistentVolumeClaim(namespace, pvcManifest);
    }

    // 2. Create Deployment
    const resources = {
        requests: {
            cpu: cpu || '500m',
            memory: memory || '1Gi',
        },
        limits: {
            cpu: cpu || '1000m',
            memory: memory || '2Gi',
        },
    };

    if (gpu) {
        resources.limits['nvidia.com/gpu'] = '1';
    }

    const initContainers = [];
    if (gitRepo) {
        initContainers.push({
            name: 'git-clone',
            image: 'alpine/git',
            args: ['clone', gitRepo, '/work/repo'],
            volumeMounts: [{
                mountPath: '/work',
                name: 'notebook-storage',
            }],
        });
    }

    const deploymentManifest = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
            name: podName,
            namespace: namespace,
            labels: { app: podName },
        },
        spec: {
            replicas: 1,
            selector: {
                matchLabels: { app: podName },
            },
            template: {
                metadata: {
                    labels: { app: podName },
                },
                spec: {
                    initContainers: initContainers.length > 0 ? initContainers : undefined,
                    containers: [
                        {
                            name: 'jupyter',
                            image: 'ml-notebook:latest', // Custom image
                            imagePullPolicy: 'IfNotPresent', // Important for local images
                            ports: [{ containerPort: 8888 }],
                            env: [
                                { name: 'JUPYTER_TOKEN', value: 'notebook' },
                                { name: 'JUPYTER_ENABLE_LAB', value: 'yes' }
                            ],
                            resources: resources,
                            volumeMounts: [
                                {
                                    mountPath: '/home/jovyan/work',
                                    name: 'notebook-storage',
                                },
                            ],
                        },
                    ],
                    volumes: [
                        {
                            name: 'notebook-storage',
                            persistentVolumeClaim: {
                                claimName: pvcName,
                            },
                        },
                    ],
                    nodeSelector: gpu ? { 'accelerator': 'gpu' } : undefined, // Assumes nodes are labeled 'accelerator=gpu'
                },
            },
        },
    };

    try {
        await k8sAppsApi.readNamespacedDeployment(podName, namespace);
        // Optional: Patch if needed, but for now assume if it exists it's fine
    } catch (e) {
        await k8sAppsApi.createNamespacedDeployment(namespace, deploymentManifest);
    }

    // 3. Create Service
    const serviceManifest = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: `${podName}-svc`,
            namespace: namespace,
        },
        spec: {
            selector: { app: podName },
            ports: [
                {
                    protocol: 'TCP',
                    port: 80,
                    targetPort: 8888,
                    nodePort: 30000 + Math.floor(Math.random() * 2000),
                },
            ],
            type: 'NodePort',
        },
    };

    let nodePort;
    try {
        const existingSvc = await k8sApi.readNamespacedService(`${podName}-svc`, namespace);
        nodePort = existingSvc.body.spec.ports[0].nodePort;
    } catch (e) {
        const serviceResponse = await k8sApi.createNamespacedService(namespace, serviceManifest);
        nodePort = serviceResponse.body.spec.ports[0].nodePort;
    }

    return nodePort;
};

// @desc    Create a new notebook
// @route   POST /api/notebook/create
// @access  Private
const createNotebook = async (req, res) => {
  // SECURITY FLOW:
  // 1. Authentication: Verified by authenticateToken middleware (req.user populated)
  // 2. Authorization: Any valid user can create a notebook, but...
  // 3. Isolation: Resources are tagged with userId and ownership is enforced on access/delete.
  // 4. Brokerage: This function acts as the bridge. User request -> Backend -> K8s API.

  const { name, cpu, ram, storage, gpu, gitRepo } = req.body;
  const userId = req.user._id;
  
  // 1. Quota Check (Policy Enforcement)
  // Prevents resource exhaustion attacks by limiting per-user consumption.
  const userNotebooks = await Notebook.find({ userId: userId });
  let currentCpu = 0;
  let currentMemory = 0;
  let currentGpu = 0;

  userNotebooks.forEach(nb => {
      currentCpu += parseCpu(nb.cpu);
      currentMemory += parseMemory(nb.memory);
      if (nb.gpu) currentGpu += 1;
  });

  const reqCpu = parseCpu(cpu);
  const reqMemory = parseMemory(ram);
  const reqGpu = gpu ? 1 : 0;

  // Use user's quota or default
  // Updated default to 16GB to match frontend UI
  const userQuota = req.user.quota || { cpu: 4.0, memory: 16384, gpu: 1 };

  if (currentCpu + reqCpu > userQuota.cpu) {
      res.status(400).json({ message: `CPU Quota Exceeded. Limit: ${userQuota.cpu}, Used: ${currentCpu}, Requested: ${reqCpu}` });
      return;
  }
  if (currentMemory + reqMemory > userQuota.memory) {
      res.status(400).json({ message: `Memory Quota Exceeded. Limit: ${userQuota.memory}MB, Used: ${currentMemory}MB, Requested: ${reqMemory}MB` });
      return;
  }
  if (currentGpu + reqGpu > userQuota.gpu) {
      res.status(400).json({ message: `GPU Quota Exceeded. Limit: ${userQuota.gpu}, Used: ${currentGpu}, Requested: ${reqGpu}` });
      return;
  }

  // Generate valid K8s names
  const safeName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const podName = `nb-${safeName}-${userId.toString().slice(-4)}`;
  const pvcName = `${podName}-pvc`;
  const namespace = 'default';
  const memory = ram; // Map ram from frontend to memory in schema

  try {
    const nodePort = await provisionK8sResources(podName, pvcName, namespace, cpu, memory, storage, gpu, gitRepo);

    // Save to DB
    const notebook = await Notebook.create({
      userId: userId,
      name: name,
      podName: podName,
      pvcName: pvcName,
      cpu: cpu,
      memory: memory,
      storage: storage,
      gpu: gpu || false,
      gitRepo: gitRepo || '',
      status: 'Running',
      accessURL: `http://localhost:${nodePort}/?token=notebook`,
      namespace: namespace,
    });

    res.status(201).json(notebook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to provision notebook', error: error.body || error.message });
  }
};

// @desc    Get user notebooks
// @route   GET /api/notebook/list
// @access  Private
const getNotebooks = async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
  const notebooks = await Notebook.find(query);
  res.json(notebooks);
};

// @desc    Delete notebook
// @route   DELETE /api/notebook/delete/:id
// @access  Private
const deleteNotebook = async (req, res) => {
  const notebook = await Notebook.findById(req.params.id);

  if (notebook) {
    if (notebook.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403).json({ message: 'Not authorized' });
        return;
    }

    const podName = notebook.podName;
    const pvcName = notebook.pvcName;
    const namespace = notebook.namespace || 'default';

    try {
        // Delete K8s resources
        try { await k8sAppsApi.deleteNamespacedDeployment(podName, namespace); } catch(e) {}
        try { await k8sApi.deleteNamespacedService(`${podName}-svc`, namespace); } catch(e) {}
        try { await k8sApi.deleteNamespacedPersistentVolumeClaim(pvcName, namespace); } catch(e) {}

        // Delete persisted file
        const filePath = path.join(__dirname, '../../notebook_data', `${notebook._id}.json`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await notebook.deleteOne();
        res.json({ message: 'Notebook removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete k8s resources', error: error.message });
    }
  } else {
    res.status(404);
    res.json({ message: 'Notebook not found' });
  }
};

// @desc    Reconnect/Start notebook
// @route   POST /api/notebook/reconnect/:id
// @access  Private
const reconnectNotebook = async (req, res) => {
    const notebook = await Notebook.findById(req.params.id);

    if (!notebook) {
        res.status(404);
        res.json({ message: 'Notebook not found' });
        return;
    }

    if (notebook.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        res.json({ message: 'Not authorized' });
        return;
    }

    const podName = notebook.podName;
    const pvcName = notebook.pvcName;
    const namespace = notebook.namespace || 'default';

    try {
        // Ensure resources exist (Idempotent)
        const nodePort = await provisionK8sResources(
            podName, 
            pvcName, 
            namespace, 
            notebook.cpu, 
            notebook.memory, 
            notebook.storage,
            notebook.gpu,
            notebook.gitRepo
        );

        // Update URL just in case NodePort changed (if service was recreated)
        notebook.accessURL = `http://localhost:${nodePort}/?token=notebook`;
        notebook.status = 'Running';
        await notebook.save();

        res.json({ 
            message: 'Notebook connected', 
            accessURL: notebook.accessURL 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to reconnect notebook', error: error.message });
    }
};

// @desc    Save notebook content
// @route   POST /api/notebook/:id/content
// @access  Private
const saveNotebookContent = async (req, res) => {
    const { id } = req.params;
    const { cells } = req.body;

    const notebook = await Notebook.findById(id);
    if (!notebook) {
        return res.status(404).json({ message: 'Notebook not found' });
    }

    if (notebook.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        const filePath = path.join(__dirname, '../../notebook_data', `${id}.json`);
        const data = {
            id,
            cells,
            updatedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        res.json({ message: 'Notebook saved successfully' });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ message: 'Failed to save notebook content' });
    }
};

// @desc    Get notebook content
// @route   GET /api/notebook/:id/content
// @access  Private
const getNotebookContent = async (req, res) => {
    const { id } = req.params;

    const notebook = await Notebook.findById(id);
    if (!notebook) {
        return res.status(404).json({ message: 'Notebook not found' });
    }

    if (notebook.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        const filePath = path.join(__dirname, '../../notebook_data', `${id}.json`);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.json(JSON.parse(content));
        } else {
            // Return default empty structure if file doesn't exist
            res.json({ 
                id, 
                cells: [
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
  ]
            });
        }
    } catch (error) {
        console.error('Load error:', error);
        res.status(500).json({ message: 'Failed to load notebook content' });
    }
};

// @desc    Get system status
// @route   GET /api/notebook/system-status
// @access  Private (Admin)
const getSystemStatus = async (req, res) => {
    try {
        const nodesRes = await k8sApi.listNode();
        const nodes = nodesRes.body.items;
        const k8sVersion = nodes.length > 0 ? nodes[0].status.nodeInfo.kubeletVersion : 'Unknown';
        
        res.json({
            status: 'Healthy',
            k8sVersion: k8sVersion,
            nodeCount: nodes.length,
            cluster: 'Local Cluster' // Or infer from context
        });
    } catch (error) {
        console.error('K8s Error:', error);
        // Don't fail the request, just report unhealthy
        res.json({
            status: 'Unhealthy',
            k8sVersion: 'Unknown',
            nodeCount: 0,
            error: error.message
        });
    }
};

module.exports = { 
    createNotebook, 
    getNotebooks, 
    deleteNotebook, 
    reconnectNotebook,
    saveNotebookContent,
    getNotebookContent,
    getSystemStatus
};