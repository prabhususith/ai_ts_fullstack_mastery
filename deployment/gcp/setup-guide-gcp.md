# Google Cloud Platform (GCP) Enterprise Deployment & Provisioning Guide

## Architecture Overview
The GCP architecture deployment consists of:
- **Compute:** Google Cloud Run (Serverless multi-container instances with HTTP concurrency).
- **Relational & Vector Database:** Google Cloud SQL for PostgreSQL 16 with `cloudsql.enable_pgvector` database flag.
- **Cache & Message Broker:** Google Memorystore for Redis with Serverless VPC Access.
- **Security & Secrets:** Google Secret Manager and IAM Service Account bindings.

---

## Step 1: Provision Cloud SQL for PostgreSQL with pgvector

1. Create Cloud SQL PostgreSQL 16 instance with the pgvector database flag:
   ```bash
   gcloud sql instances create ai-enterprise-db \
     --database-version=POSTGRES_16 \
     --tier=db-custom-2-7680 \
     --region=us-central1 \
     --database-flags=cloudsql.enable_pgvector=on \
     --root-password="HighEntropySecretPassword123!"
   ```

2. Create database and connect to enable the extension:
   ```bash
   gcloud sql databases create ai_enterprise_db --instance=ai-enterprise-db
   ```
   Execute in psql session:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

---

## Step 2: Provision Google Memorystore for Redis & VPC Connector

1. Create Serverless VPC Access Connector:
   ```bash
   gcloud compute networks vpc-access connectors create vpc-connector \
     --region=us-central1 \
     --network=default \
     --range=10.8.0.0/28
   ```

2. Create Memorystore Redis instance:
   ```bash
   gcloud redis instances create ai-enterprise-redis \
     --size=2 \
     --region=us-central1 \
     --redis-version=redis_7_0 \
     --network=default \
     --connect-mode=PRIVATE_SERVICE_ACCESS
   ```

---

## Step 3: Deploy to Cloud Run

1. Build and push image to Google Artifact Registry:
   ```bash
   gcloud builds submit --tag us-central1-docker.pkg.dev/my-project/ai-repo/backend:latest ./backend
   ```

2. Deploy using YAML manifest:
   ```bash
   gcloud run services replace deployment/gcp/cloud-run-service.yaml --region=us-central1
   ```
