# Microsoft Azure Enterprise Deployment & Provisioning Guide

## Architecture Overview
The Azure architecture consists of:
- **Compute:** Azure Container Apps (ACA) with built-in KEDA auto-scaling and Envoy ingress.
- **Relational & Vector Database:** Azure Database for PostgreSQL Flexible Server with `pgvector` extension enabled.
- **Cache Tier:** Azure Cache for Redis (Premium tier, private endpoint enabled).
- **Security & Identity:** Azure Managed Identities (MSI) and Azure Key Vault for secret resolution without hardcoded passwords.

---

## Step 1: Provision Azure Database for PostgreSQL Flexible Server

1. Create resource group:
   ```bash
   az group create --name rg-ai-enterprise --location eastus
   ```

2. Create PostgreSQL Flexible Server:
   ```bash
   az postgres flexible-server create \
     --resource-group rg-ai-enterprise \
     --name ai-enterprise-postgres \
     --location eastus \
     --admin-user pgadmin \
     --admin-password "HighEntropyP@ssw0rd!" \
     --sku-name Standard_D2ds_v5 \
     --tier GeneralPurpose \
     --storage-size 128 \
     --version 16
   ```

3. Enable `vector` extension in PostgreSQL server configuration:
   ```bash
   az postgres flexible-server parameter set \
     --resource-group rg-ai-enterprise \
     --server-name ai-enterprise-postgres \
     --name azure.extensions \
     --value "VECTOR"
   ```

4. Connect via psql and initialize:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

---

## Step 2: Provision Azure Cache for Redis

```bash
az redis create \
  --resource-group rg-ai-enterprise \
  --name ai-enterprise-redis \
  --location eastus \
  --sku Premium \
  --vm-size P1 \
  --enable-non-ssl-port false \
  --minimum-tls-version 1.2
```

---

## Step 3: Deploy Azure Container Apps (ACA)

1. Create Container App environment:
   ```bash
   az containerapp env create \
     --name ai-enterprise-env \
     --resource-group rg-ai-enterprise \
     --location eastus
   ```

2. Apply YAML deployment specification:
   ```bash
   az containerapp create \
     --resource-group rg-ai-enterprise \
     --name ai-enterprise-backend \
     --environment ai-enterprise-env \
     --yaml deployment/azure/azure-container-apps.yaml
   ```
