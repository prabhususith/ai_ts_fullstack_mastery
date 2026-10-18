# Volume 06: Kubernetes Architecture Diagrams & Visual Workflows

**Author:** Principal Cloud-Native Infrastructure Architect & Staff DevSecOps Engineer  
**Scope:** Production Pod Networking, Ingress Traffic Routing, Stateful Storage Lifecycles, and Autoscaling Loops

---

## 1. End-to-End Ingress Traffic Routing & Pod Networking

```mermaid
flowchart TD
    subgraph External ["External Traffic"]
        InternetClient["Public HTTPS Client / Browser"]
    end

    subgraph IngressController ["Ingress & Edge Routing"]
        CloudIngress["Ingress Controller (ALB / AGIC / GCE / Nginx)"]
        TLSTermination["TLS Termination (Cert-Manager / Cloud SSL)"]
    end

    subgraph ServiceMesh ["ai-enterprise Kubernetes Namespace"]
        FrontendSvc["Service: frontend (ClusterIP:80)"]
        BackendSvc["Service: backend (ClusterIP:4000)"]
        PostgresSvc["Service: postgres (ClusterIP:5432)"]
        RedisSvc["Service: redis (ClusterIP:6379)"]

        FrontendPods["Frontend Pods (Nginx 1.25 Alpine / SPA)"]
        BackendPods["Backend Pods (Node 20+ Express TypeScript)"]
        PostgresPod["PostgreSQL StatefulSet (ankane/pgvector)"]
        RedisPod["Redis Deployment (redis:7-alpine)"]
    end

    InternetClient -->|"HTTPS :443"| CloudIngress
    CloudIngress --> TLSTermination
    TLSTermination -->|"Path: /"| FrontendSvc
    TLSTermination -->|"Path: /api, /ws"| BackendSvc

    FrontendSvc --> FrontendPods
    BackendSvc --> BackendPods

    BackendPods -->|"SQL :5432 (pgvector HNSW)"| PostgresSvc
    BackendPods -->|"TCP :6379 (Semantic Cache)"| RedisSvc

    PostgresSvc --> PostgresPod
    RedisSvc --> RedisPod
```

---

## 2. Stateful Storage Lifecycle (pgvector Persistence)

```mermaid
sequenceDiagram
    autonumber
    participant K8s as Kubernetes API Server
    participant Provisioner as CSI Driver (EBS / Azure Disk / GKE PD)
    participant StorageClass as StorageClass (gp3 / managed-csi / pd-balanced)
    participant PVC as PersistentVolumeClaim (postgres-data)
    participant PV as PersistentVolume (Bound)
    participant Pod as PostgreSQL Pod (postgres-0)

    Pod->>K8s: StatefulSet scheduled on worker node
    K8s->>PVC: Evaluate VolumeClaimTemplate
    PVC->>StorageClass: Request 10Gi volume (WaitForFirstConsumer)
    StorageClass->>Provisioner: Allocate cloud disk volume
    Provisioner-->>PV: Provision disk and create PV object
    PV-->>PVC: Transition status to Bound
    K8s->>Pod: Attach & mount PV to /var/lib/postgresql/data
    Pod->>Pod: Initialize PostgreSQL 16 & pgvector HNSW indexes
```

---

## 3. Horizontal Pod Autoscaler (HPA) Metrics & Scaling Loop

```mermaid
stateDiagram-v2
    [*] --> NormalLoad : Steady State Traffic (CPU < 70%, Memory < 80%)
    
    NormalLoad --> SpikeDetected : LLM Prompt Load Increases (CPU > 70%)
    SpikeDetected --> ScalingUp : Metrics Server alerts HPA Controller
    ScalingUp --> ScaleOutPods : Replicas scale from 2 up to 10
    ScaleOutPods --> TrafficDistributed : Load balanced across worker nodes
    
    TrafficDistributed --> LoadNormalized : Traffic subsides (CPU < 50%)
    LoadNormalized --> CooldownTimer : Stabilization Window (default 300s)
    CooldownTimer --> ScaleDownPods : Graceful termination of excess pods
    ScaleDownPods --> NormalLoad : MinReplicas (2) restored
```

---

## 4. Multi-Cloud Ingress Architecture Comparison

| Cloud Provider | Ingress Controller | Annotation Class | Target Type | TLS Certificate Provider |
| :--- | :--- | :--- | :--- | :--- |
| **Localhost** | Ingress-Nginx | `kubernetes.io/ingress.class: nginx` | Pod IP / HostPort | Local self-signed / Cert-Manager |
| **AWS EKS** | AWS Load Balancer Controller | `alb.ingress.kubernetes.io/scheme: internet-facing` | IP mode (`awsvpc`) | AWS Certificate Manager (ACM) |
| **Azure AKS** | Application Gateway (AGIC) | `kubernetes.io/ingress.class: azure/application-gateway` | CNI Pod IP | Azure Key Vault / App Gateway SSL |
| **GCP GKE** | GCE Ingress Controller | `kubernetes.io/ingress.class: gce` | VPC-native NEG | Google Managed Certificate (`networking.gke.io`) |
