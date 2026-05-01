const Notebook = require('../models/Notebook');
const { k8sAppsApi, k8sApi, k8sNetworkingApi } = require('../config/k8s');
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

// ─── Image Registry ───────────────────────────────────────────────────────────
const NOTEBOOK_IMAGES = {
  // ── Base Python (no ML libs) ──────────────────────────────────────────────
  'basic':                   process.env.IMG_BASIC          || 'jupyter/base-notebook:python-3.11',
  'basic-py311':             process.env.IMG_BASIC_PY311    || 'jupyter/base-notebook:python-3.11',
  'basic-py310':             process.env.IMG_BASIC_PY310    || 'jupyter/base-notebook:python-3.10',

  // ── ML Standard (numpy, pandas, sklearn, matplotlib) ──────────────────────
  'ml':                      process.env.IMG_ML             || 'ml-notebook:latest',
  'ml-py311':                process.env.IMG_ML_PY311       || 'ml-notebook:py311',
  'ml-py310':                process.env.IMG_ML_PY310       || 'ml-notebook:py310',
  // Legacy aliases
  'ml-standard':             process.env.IMG_ML             || 'ml-notebook:latest',
  'ml-standard-py311':       process.env.IMG_ML_PY311       || 'ml-notebook:py311',
  'ml-standard-py310':       process.env.IMG_ML_PY310       || 'ml-notebook:py310',

  // ── GPU PyTorch (CUDA 12.1 + torch 2.3) ───────────────────────────────────
  'gpu_pytorch':             process.env.IMG_PYTORCH        || 'ml-notebook-pytorch:latest',
  'gpu_pytorch-py311':       process.env.IMG_PYTORCH_PY311  || 'ml-notebook-pytorch:py311',

  // ── GPU TensorFlow (CUDA 12.3 + tf 2.16) ─────────────────────────────────
  'gpu_tensorflow':          process.env.IMG_TENSORFLOW     || 'ml-notebook-tensorflow:latest',
  'gpu_tensorflow-py311':    process.env.IMG_TF_PY311       || 'ml-notebook-tensorflow:py311',

  // ── Legacy GPU key ────────────────────────────────────────────────────────
  'gpu':                     process.env.IMG_PYTORCH        || 'ml-notebook-pytorch:latest',
};

// Resolve image with version suffix fallback
const resolveImage = (environment = 'ml') => {
  return NOTEBOOK_IMAGES[environment]
    || NOTEBOOK_IMAGES[environment.split('-py')[0]]
    || NOTEBOOK_IMAGES['ml'];
};

// Determine if environment needs GPU
const needsGpu = (environment) =>
  environment?.startsWith('gpu') || environment === 'gpu';


// Helper to create K8s resources
const provisionK8sResources = async (podName, pvcName, namespace, cpu, memory, storage, gpu, gitRepo, environment = 'ml', userId = 'anon') => {
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

    // Auto-detect GPU requirement from environment name
    const gpuRequired = gpu || needsGpu(environment);
    if (gpuRequired) {
        resources.requests['nvidia.com/gpu'] = '1';
        resources.limits['nvidia.com/gpu'] = '1';
    }

    // For GPU images, use a higher default memory
    if (gpuRequired && !memory) {
        resources.requests.memory = '4Gi';
        resources.limits.memory  = '8Gi';
    }

    const initContainers = [
        {
            name: 'env-verify',
            image: resolveImage(environment),
            imagePullPolicy: 'IfNotPresent',
            // For GPU envs, just check Python — GPU not available at init-container level
            command: ['python', '-c',
                needsGpu(environment)
                  ? 'import torch, numpy, pandas; print("\u2705 GPU environment ready")'
                  : 'import numpy, pandas, sklearn, matplotlib; print("\u2705 ML environment ready")'
            ],
            resources: { requests: { cpu: '50m', memory: '128Mi' }, limits: { cpu: '200m', memory: '256Mi' } },
            volumeMounts: [{ mountPath: '/home/jovyan/work', name: 'notebook-storage' }],
        },
    ];

    // Optional: git-clone init container
    if (gitRepo) {
        initContainers.push({
            name: 'git-clone',
            image: 'alpine/git:latest',
            args: ['clone', '--depth', '1', gitRepo, '/home/jovyan/work/repo'],
            volumeMounts: [{ mountPath: '/home/jovyan/work', name: 'notebook-storage' }],
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
                            // ── Use the correct ML image based on environment + version ──
                            image: resolveImage(environment),
                            imagePullPolicy: 'IfNotPresent', // Critical for Minikube local images
                            ports: [{ name: 'jupyter', containerPort: 8888 }],
                            env: [
                                // Token for Jupyter authentication
                                { name: 'JUPYTER_TOKEN',               value: process.env.JUPYTER_TOKEN || 'notebook' },
                                // Enable JupyterLab UI
                                { name: 'JUPYTER_ENABLE_LAB',          value: 'yes' },
                                // Allow wider CORS for frontend proxy
                                { name: 'JUPYTER_ALLOW_INSECURE_WRITES', value: 'true' },
                                // Pass environment label for introspection
                                { name: 'NOTEBOOK_ENV',                value: environment },
                                // Prevent Jupyter from creating hidden .local dir on read-only FSes
                                { name: 'HOME',                        value: '/home/jovyan' },
                            ],
                            resources,
                            volumeMounts: [
                                { mountPath: '/home/jovyan/work', name: 'notebook-storage' },
                            ],
                            // Readiness: only route traffic once Jupyter API responds
                            readinessProbe: {
                                httpGet: { path: '/api/status', port: 8888 },
                                initialDelaySeconds: 20,
                                periodSeconds: 10,
                                failureThreshold: 5,
                            },
                            // Liveness: restart if Jupyter process hangs
                            livenessProbe: {
                                httpGet: { path: '/api/status', port: 8888 },
                                initialDelaySeconds: 60,
                                periodSeconds: 30,
                                failureThreshold: 3,
                            },
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
                    // Run as jovyan (uid 1000) — never run Jupyter as root
                    securityContext: {
                        runAsUser: 1000,
                        fsGroup: 100,
                    },
                    initContainers,
                    // GPU nodes must be labeled: accelerator=gpu
                    nodeSelector: gpuRequired ? { 'accelerator': 'gpu' } : undefined,
                    // Tolerate NVIDIA device-plugin taint if present
                    tolerations: gpuRequired ? [{
                        key: 'nvidia.com/gpu',
                        operator: 'Exists',
                        effect: 'NoSchedule',
                    }] : undefined,
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


    // 3. Create ClusterIP Service (Ingress routes to this — no NodePort needed)
    const svcName = `${podName}-svc`;

    const serviceManifest = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: svcName,
            namespace,
            labels: { 'managed-by': 'ml-platform', notebook: podName },
        },
        spec: {
            selector: { app: podName },
            type: 'ClusterIP',   // Ingress handles external access
            ports: [{ name: 'jupyter', protocol: 'TCP', port: 80, targetPort: 8888 }],
        },
    };

    try {
        await k8sApi.readNamespacedService(svcName, namespace);
    } catch (e) {
        await k8sApi.createNamespacedService(namespace, serviceManifest);
    }

    // 4. Create per-notebook Ingress with path-based routing
    //    URL pattern: http://notebooks.local/user/{userId}/nb/{podName}
    const ingressName = `${podName}-ingress`;
    const notebookPath = `/user/${userId}/nb/${podName}`;
    const jupyterToken = process.env.JUPYTER_TOKEN || 'notebook';

    const ingressManifest = {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: {
            name: ingressName,
            namespace,
            annotations: {
                'kubernetes.io/ingress.class': 'nginx',
                // Strip the path prefix so Jupyter receives requests at /
                'nginx.ingress.kubernetes.io/rewrite-target': '/$2',
                'nginx.ingress.kubernetes.io/proxy-body-size': '512m',
                'nginx.ingress.kubernetes.io/proxy-read-timeout': '3600',
                'nginx.ingress.kubernetes.io/proxy-send-timeout': '3600',
                'nginx.ingress.kubernetes.io/ssl-redirect': 'false',
                // WebSocket upgrade required for Jupyter kernel
                'nginx.ingress.kubernetes.io/configuration-snippet': [
                    'proxy_set_header Upgrade $http_upgrade;',
                    'proxy_set_header Connection "upgrade";',
                ].join('\n'),
            },
            labels: { 'managed-by': 'ml-platform', userId: String(userId) },
        },
        spec: {
            rules: [{
                host: process.env.INGRESS_HOST || 'notebooks.local',
                http: {
                    paths: [{
                        // Capture: /user/{uid}/nb/{pod}  + remainder in $2
                        path: `${notebookPath}(/|$)(.*)`,
                        pathType: 'ImplementationSpecific',
                        backend: {
                            service: { name: svcName, port: { number: 80 } },
                        },
                    }],
                },
            }],
        },
    };

    try {
        await k8sNetworkingApi.readNamespacedIngress(ingressName, namespace);
    } catch (e) {
        await k8sNetworkingApi.createNamespacedIngress(namespace, ingressManifest);
    }

    // Return full publicly-accessible URL
    const host = process.env.INGRESS_HOST || 'notebooks.local';
    return `http://${host}${notebookPath}/?token=${jupyterToken}`;
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

  const { name, cpu, ram, storage, gpu, gitRepo, environment = 'ml', pythonVersion = '3.11' } = req.body;
  const userId = req.user._id;
  
  // 1. Quota Check (Policy Enforcement)
  // Prevents resource exhaustion attacks by limiting per-user consumption.
  const userNotebooks = await Notebook.find({ userId: userId });
  let currentCpu = 0;
  let currentMemory = 0;
  let currentGpu = 0;

  // Only count RUNNING notebooks toward quota (stopped/failed ones free up resources)
  const runningNotebooks = userNotebooks.filter(nb => nb.status === 'Running');
  runningNotebooks.forEach(nb => {
      currentCpu    += parseCpu(nb.cpu);
      currentMemory += parseMemory(nb.memory);
      if (nb.gpu) currentGpu += 1;
  });

  const reqCpu    = parseCpu(cpu);
  const reqMemory = parseMemory(ram);
  const reqGpu    = (gpu || needsGpu(environment)) ? 1 : 0;

  // Generous defaults for dev/testing — override via user.quota in DB for production
  const userQuota = req.user.quota || { cpu: 16, memory: 65536, gpu: 4 };

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
    const accessURL = await provisionK8sResources(
      podName, pvcName, namespace, cpu, memory, storage, gpu, gitRepo, environment, userId
    );

    // Save to DB
    const notebook = await Notebook.create({
      userId,
      name,
      podName,
      pvcName,
      cpu,
      memory,
      storage,
      gpu: gpu || needsGpu(environment),
      gitRepo:     gitRepo  || '',
      framework:   environment,
      status:      'Running',
      accessURL,               // full Ingress URL returned by provisioner
      namespace,
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
        // Delete K8s resources (silent fail — resource may not exist yet)
        try { await k8sAppsApi.deleteNamespacedDeployment(podName, namespace); } catch(e) {}
        try { await k8sApi.deleteNamespacedService(`${podName}-svc`, namespace); } catch(e) {}
        try { await k8sApi.deleteNamespacedPersistentVolumeClaim(pvcName, namespace); } catch(e) {}
        try { await k8sNetworkingApi.deleteNamespacedIngress(`${podName}-ingress`, namespace); } catch(e) {}

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
        // Ensure resources exist (Idempotent) — returns the full Ingress access URL
        const accessURL = await provisionK8sResources(
            podName,
            pvcName,
            namespace,
            notebook.cpu,
            notebook.memory,
            notebook.storage,
            notebook.gpu,
            notebook.gitRepo,
            notebook.framework || 'ml',
            notebook.userId
        );

        // Persist the fresh URL (Ingress host may have changed)
        notebook.accessURL = accessURL;
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

// @desc    Stop (pause) a notebook — scales deployment to 0, keeps PVC
// @route   POST /api/notebook/stop/:id
// @access  Private
const stopNotebook = async (req, res) => {
    const notebook = await Notebook.findById(req.params.id);

    if (!notebook) {
        return res.status(404).json({ message: 'Notebook not found' });
    }

    if (notebook.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    if (notebook.status === 'Stopped') {
        return res.status(400).json({ message: 'Notebook is already stopped' });
    }

    const { podName, namespace = 'default' } = notebook;

    try {
        // Scale the Deployment to 0 replicas — kills the pod but preserves the PVC/data
        try {
            await k8sAppsApi.patchNamespacedDeployment(
                podName,
                namespace,
                [{ op: 'replace', path: '/spec/replicas', value: 0 }],
                undefined, undefined, undefined, undefined,
                { headers: { 'Content-Type': 'application/json-patch+json' } }
            );
        } catch (k8sErr) {
            // If the deployment doesn't exist (e.g. mock mode), log and continue
            console.warn(`[Stop] K8s scale-down skipped: ${k8sErr.message || k8sErr}`);
        }

        notebook.status = 'Stopped';
        await notebook.save();

        res.json({ message: 'Notebook stopped. Your data is preserved.', status: 'Stopped' });
    } catch (error) {
        console.error('[Stop] Error:', error);
        res.status(500).json({ message: 'Failed to stop notebook', error: error.message });
    }
};


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
        const dataDir  = path.join(__dirname, '../../notebook_data');
        const filePath = path.join(dataDir, `${id}.json`);

        // Ensure directory exists — safe even if it already does
        fs.mkdirSync(dataDir, { recursive: true });

        const data = {
            id,
            cells,
            updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        res.json({ message: 'Notebook saved successfully' });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ message: 'Failed to save notebook content', detail: error.message });
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
    stopNotebook,
    saveNotebookContent,
    getNotebookContent,
    getSystemStatus
};