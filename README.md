# Self-Service ML Notebook Provisioning System

A full-stack platform for dynamically provisioning Jupyter Notebooks on Kubernetes with custom machine learning environments. Built with React, Node.js, MongoDB, and Kubernetes.

## 🚀 Features

- **User Authentication**: Secure login/registration system.
- **Dynamic Provisioning**: On-demand creation of Jupyter Pods with persistent storage (PVC).
- **Resource Management**: Configure CPU, RAM, and Storage limits per notebook.
- **Custom ML Environment**: Pre-loaded with `tensorflow`, `torch`, `pandas`, `scikit-learn`, and more.
- **Dashboard**: Real-time status tracking (Pending/Running), one-click connection, and resource cleanup.
- **Secure Access**: Token-based notebook access and Kubernetes RBAC integration.

---

## 🛠️ Architecture

- **Frontend**: React (Vite) + React Bootstrap
- **Backend**: Node.js (Express) + `@kubernetes/client-node`
- **Database**: MongoDB
- **Infrastructure**: Kubernetes (Minikube/Kind/Cloud) + Docker

---

## 📋 Prerequisites

- **Docker Desktop** installed and running.
- **Node.js** (optional, for local development outside containers).
- **Kubernetes Cluster & Kubectl** (optional, if deploying to K8s).

---

## 📦 Deployment Guide

You can run the application locally using Docker Compose (recommended for quick testing and development) or deploy it to a Kubernetes cluster.

### Option 1: Local Development with Docker Compose

This is the easiest way to get the full stack running locally. The backend will run with a mock Kubernetes service so you can test the UI without a real cluster.

1. Ensure Docker Desktop is running.
2. In the root directory, run:
   ```bash
   docker-compose up -d --build
   ```
3. Access the Frontend at `http://localhost:5173`.
4. Access the Backend API at `http://localhost:5000`.

To stop the services:
```bash
docker-compose down
```

### Option 2: Kubernetes Deployment

#### 1. Build Docker Images

Build the images for the backend, frontend, and the custom Jupyter environment.

```bash
# 1. Build Backend
docker build -t ml-backend:latest ./backend

# 2. Build Frontend
docker build -t ml-frontend:latest ./frontend

# 3. Build Custom Jupyter Notebook Image
docker build -t ml-notebook:latest ./notebook-image
```

> **Note for Minikube Users:**
> If you are using Minikube, load the images directly into the cluster so Kubernetes can find them without a registry:
> ```bash
> minikube image load ml-backend:latest
> minikube image load ml-frontend:latest
> minikube image load ml-notebook:latest
> ```
>
> **Note for Kind Users:**
> ```bash
> kind load docker-image ml-backend:latest
> kind load docker-image ml-frontend:latest
> kind load docker-image ml-notebook:latest
> ```

#### 2. Setup Kubernetes Cluster

Ensure your cluster is running.

```bash
# Check cluster status
kubectl cluster-info
```

#### 3. Apply RBAC Configuration

The backend requires specific permissions to create/delete Pods and PVCs.

```bash
kubectl apply -f k8s/rbac.yaml
```

#### 4. Deploy Database & Backend

Deploy MongoDB and the Node.js API server.

```bash
# Deploy MongoDB
kubectl apply -f k8s/mongodb.yaml

# Deploy Backend
kubectl apply -f k8s/backend.yaml
```

Verify the backend is running:
```bash
kubectl get pods -l app=ml-backend
```

#### 5. Deploy Frontend

Deploy the React dashboard.

```bash
kubectl apply -f k8s/frontend.yaml
```

---

## 🖥️ Accessing the Application

### Access via Docker Compose
- **Frontend**: Visit `http://localhost:5173`
- **Backend API**: Visit `http://localhost:5000`

### Access via Kubernetes

The frontend is exposed via a NodePort service on port **30080**.

- **Minikube**:
  ```bash
  minikube service ml-frontend
  ```
  Or visit: `http://<MINIKUBE_IP>:30080`

- **Docker Desktop / Localhost**:
  Visit: `http://localhost:30080`

### Usage Flow

1.  **Register**: Create a new account on the login page.
2.  **Create Notebook**:
    *   Click "Create Notebook".
    *   Enter a name (e.g., "Deep Learning Lab").
    *   Select resources (CPU: 1.0, RAM: 2GB, Storage: 1GB).
    *   Click "Create".
3.  **Wait for Provisioning**: The status will change from `Pending` to `Running`.
4.  **Connect**: Click **Connect / Reconnect**. This will open your Jupyter environment in a new tab.
5.  **Manage**: Delete the notebook when finished to free up cluster resources.

---

## 🔧 Troubleshooting

**Notebook stuck in "Pending"?**
- Check if your cluster has enough resources (CPU/RAM).
- Check the backend logs:
  ```bash
  kubectl logs -l app=ml-backend
  ```
- Check the notebook pod events:
  ```bash
  kubectl describe pod <pod-name>
  ```

**Cannot connect to Notebook?**
- Ensure the tunnel to the notebook service is active (if running locally without a LoadBalancer).
- In Minikube, you might need `minikube tunnel` or use the NodePort IP directly.

**Backend "Unauthorized" errors?**
- Verify RBAC is applied correctly: `kubectl get rolebinding ml-backend-rolebinding`.

---

## 📜 License

MIT License
