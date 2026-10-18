# Volume 05: GCP GKE Production Deployment Guide

**Target Environment:** Google Kubernetes Engine (GKE)  
**Tools Required:** `gcloud`, `kubectl`, `helm`  
**Infrastructure Target:** GKE Autopilot / Standard Cluster, Workload Identity, Cloud SQL for PostgreSQL 16 (pgvector), Cloud Memorystore, Cloud Armor

---

## 1. Provisioning GKE Cluster with Workload Identity

1. Create a regional GKE Standard cluster with Workload Identity enabled:
   ```bash
   gcloud container clusters create-auto ai-enterprise-gke \
     --region us-central1 \
     --project my-ai-project
   ```
   Or using Standard mode with dedicated node pools:
   ```bash
   gcloud container clusters create ai-enterprise-gke \
     --region us-central1 \
     --num-nodes 3 \
     --machine-type e2-standard-4 \
     --workload-pool=my-ai-project.svc.id.goog \
     --enable-ip-alias \
     --release-channel regular
   ```

2. Fetch cluster credentials:
   ```bash
   gcloud container clusters get-credentials ai-enterprise-gke --region us-central1
   ```

---

## 2. Setting Up Workload Identity

Map Kubernetes service accounts to Google IAM service accounts for zero-credential access to Cloud SQL and Secret Manager:

```bash
# 1. Create Google Cloud IAM Service Account
gcloud iam service-accounts create ai-backend-sa \
  --description="Service account for AI TS Backend" \
  --display-name="ai-backend-sa"

# 2. Grant Cloud SQL Client and Secret Manager Access
gcloud projects add-iam-policy-binding my-ai-project \
  --member="serviceAccount:ai-backend-sa@my-ai-project.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding my-ai-project \
  --member="serviceAccount:ai-backend-sa@my-ai-project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 3. Bind K8s ServiceAccount to Google IAM ServiceAccount
gcloud iam service-accounts add-iam-policy-binding \
  ai-backend-sa@my-ai-project.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="serviceAccount:my-ai-project.svc.id.goog[ai-enterprise/backend]"
```

---

## 3. Provisioning Cloud SQL for PostgreSQL 16 (pgvector)

1. Create instance with `cloudsql.enable_pgvector=on`:
   ```bash
   gcloud sql instances create ai-enterprise-sql \
     --database-version=POSTGRES_16 \
     --tier=db-custom-4-16384 \
     --region=us-central1 \
     --database-flags=cloudsql.enable_pgvector=on \
     --root-password="HighEntropyPassword123!"
   ```

2. Create database:
   ```bash
   gcloud sql databases create ai_enterprise_db --instance=ai-enterprise-sql
   ```

3. Connect to database and execute:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

---

## 4. Deploying via Helm 3 (GCP Overrides)

```bash
# Push container images to Google Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
docker tag ai-ts-backend:latest us-central1-docker.pkg.dev/my-ai-project/ai-repo/backend:v1.0.0
docker tag ai-ts-frontend:latest us-central1-docker.pkg.dev/my-ai-project/ai-repo/frontend:v1.0.0
docker push us-central1-docker.pkg.dev/my-ai-project/ai-repo/backend:v1.0.0
docker push us-central1-docker.pkg.dev/my-ai-project/ai-repo/frontend:v1.0.0

# Deploy using GCP production values
helm upgrade --install ai-fullstack k8s/helm/ai-ts-fullstack \
  --namespace ai-enterprise \
  --create-namespace \
  --values k8s/helm/ai-ts-fullstack/values.yaml \
  --values k8s/helm/ai-ts-fullstack/values-gcp.yaml
```

---

## 5. Verifying GKE Ingress and Managed Certificates

```bash
kubectl describe ingress gke-managed-ingress -n ai-enterprise
```
Verify the Google-managed SSL certificate reaches `Active` status and the Global External HTTP(S) Load Balancer IP responds.
