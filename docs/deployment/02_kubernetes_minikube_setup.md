# Volume 02: Local Kubernetes Orchestration Guide (Minikube & Kind)

**Target Environment:** Local Kubernetes Cluster (Minikube / Kind / Docker Desktop K8s)  
**Tools Required:** `kubectl`, `minikube` (or `kind`), `kustomize`, `helm`

---

## 1. Local Kubernetes Cluster Setup

### Option A: Minikube
```bash
# 1. Start Minikube with 4 CPUs and 8GB RAM
minikube start --cpus=4 --memory=8192 --driver=docker

# 2. Enable Nginx Ingress Controller addon
minikube addons enable ingress

# 3. Enable Metrics Server for Horizontal Pod Autoscaling (HPA)
minikube addons enable metrics-server

# 4. Point local Docker daemon to Minikube environment (to use locally built images)
# On Linux/macOS:
eval $(minikube docker-env)
# On Windows PowerShell:
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

### Option B: Kind (Kubernetes-in-Docker)
```bash
# 1. Create a Kind cluster with Ingress port mapping:
cat <<EOF | kind create cluster --name ai-cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF

# 2. Apply Nginx Ingress Controller for Kind
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

---

## 2. Building Images for Local Cluster

Build images locally so Kubernetes pods can pull without pushing to public registries:
```bash
# Build Backend image
docker build -t ai-ts-backend:latest -f Dockerfile.backend .

# Build Frontend image
docker build -t ai-ts-frontend:latest -f Dockerfile.frontend .

# If using Kind, load images into the cluster:
kind load docker-image ai-ts-backend:latest --name ai-cluster
kind load docker-image ai-ts-frontend:latest --name ai-cluster
```

---

## 3. Deploying via Kustomize (Local Overlay)

The `k8s/local` overlay imports all `k8s/base` manifests and applies local Ingress routing with `imagePullPolicy: Never`:

```bash
# 1. Inspect combined manifests
kubectl kustomize k8s/local

# 2. Apply all resources into the 'ai-enterprise' namespace
kubectl apply -k k8s/local

# 3. Wait for StatefulSets and Deployments to reach Ready state
kubectl -n ai-enterprise rollout status statefulset/postgres --timeout=120s
kubectl -n ai-enterprise rollout status deployment/redis --timeout=60s
kubectl -n ai-enterprise rollout status deployment/backend --timeout=120s
kubectl -n ai-enterprise rollout status deployment/frontend --timeout=120s
```

---

## 4. Verification & Testing

### 1. Check Running Pods & Services
```bash
kubectl get pods,svc,pvc,hpa -n ai-enterprise -o wide
```

Expected output:
```
NAME                            READY   STATUS    RESTARTS   AGE
pod/backend-78f99bc7b9-d2q8m    1/1     Running   0          45s
pod/backend-78f99bc7b9-v9p4k    1/1     Running   0          45s
pod/frontend-67bb88d8b8-4nmkl   1/1     Running   0          45s
pod/frontend-67bb88d8b8-z1q2r   1/1     Running   0          45s
pod/postgres-0                  1/1     Running   0          60s
pod/redis-549b6d859-9jk8l       1/1     Running   0          60s
```

### 2. Configure Host Resolution & Access Application
Add the local test domain to `/etc/hosts` (or `C:\Windows\System32\drivers\etc\hosts` on Windows):
```
127.0.0.1  ai-local.test
```

If using Minikube on Windows/macOS, open the tunnel:
```bash
minikube tunnel
```

Access in your browser:
- **Application Dashboard:** `http://ai-local.test`
- **Backend API Direct:** `http://ai-local.test/api/health`

---

## 5. Alternative: Deploying via Helm 3

```bash
# Install or upgrade chart using local values
helm upgrade --install ai-fullstack k8s/helm/ai-ts-fullstack \
  --namespace ai-enterprise \
  --create-namespace \
  --values k8s/helm/ai-ts-fullstack/values.yaml

# Verify Helm release
helm status ai-fullstack -n ai-enterprise
```
