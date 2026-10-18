# Volume 04: Azure AKS Production Deployment Guide

**Target Environment:** Azure Kubernetes Service (AKS)  
**Tools Required:** `az` (Azure CLI), `kubectl`, `helm`  
**Infrastructure Target:** Managed AKS Cluster, Azure Key Vault CSI Driver, Azure Database for PostgreSQL Flexible Server (pgvector), Application Gateway (AGIC)

---

## 1. Provisioning AKS Cluster via Azure CLI

Create resource group, virtual network, and AKS cluster with Workload Identity and Azure CNI enabled:

```bash
# 1. Create Resource Group
az group create --name rg-ai-enterprise-prod --location eastus

# 2. Create AKS Cluster with Managed Identity & Azure CNI
az aks create \
  --resource-group rg-ai-enterprise-prod \
  --name aks-ai-enterprise \
  --node-count 3 \
  --node-vm-size Standard_D4ds_v5 \
  --enable-managed-identity \
  --network-plugin azure \
  --enable-workload-identity \
  --enable-oidc-issuer \
  --enable-addons ingress-appgw \
  --appgw-name agw-ai-enterprise \
  --appgw-subnet-cidr "10.224.2.0/24" \
  --generate-ssh-keys

# 3. Retrieve Cluster Credentials
az aks get-credentials --resource-group rg-ai-enterprise-prod --name aks-ai-enterprise
```

---

## 2. Configuring Azure Key Vault Provider for Secrets Store CSI Driver

1. Enable Key Vault Secrets Provider addon:
   ```bash
   az aks enable-addons \
     --addons azure-keyvault-secrets-provider \
     --name aks-ai-enterprise \
     --resource-group rg-ai-enterprise-prod
   ```

2. Provision Azure Key Vault:
   ```bash
   az keyvault create \
     --name kv-ai-enterprise-prod \
     --resource-group rg-ai-enterprise-prod \
     --location eastus
   ```

3. Store secrets inside Key Vault:
   ```bash
   az keyvault secret set --vault-name kv-ai-enterprise-prod --name "jwt-secret" --value "super-secret-production-jwt-key-999"
   az keyvault secret set --vault-name kv-ai-enterprise-prod --name "db-password" --value "SuperSecurePostgresPassword123!"
   ```

---

## 3. Azure Database for PostgreSQL Flexible Server Integration

1. Provision Flexible Server:
   ```bash
   az postgres flexible-server create \
     --resource-group rg-ai-enterprise-prod \
     --name psql-ai-enterprise \
     --location eastus \
     --admin-user psqladmin \
     --admin-password "SuperSecurePostgresPassword123!" \
     --sku-name Standard_D4ds_v5 \
     --tier GeneralPurpose \
     --version 16
   ```

2. Whitelist and load `VECTOR` extension:
   ```bash
   az postgres flexible-server parameter set \
     --resource-group rg-ai-enterprise-prod \
     --server-name psql-ai-enterprise \
     --name azure.extensions \
     --value "VECTOR"
   ```

---

## 4. Deploying via Helm 3 (Azure Overrides)

```bash
# Push container images to Azure Container Registry (ACR)
az acr login --name aitsenterprise
docker tag ai-ts-backend:latest aitsenterprise.azurecr.io/backend:v1.0.0
docker tag ai-ts-frontend:latest aitsenterprise.azurecr.io/frontend:v1.0.0
docker push aitsenterprise.azurecr.io/backend:v1.0.0
docker push aitsenterprise.azurecr.io/frontend:v1.0.0

# Deploy using Azure production values
helm upgrade --install ai-fullstack k8s/helm/ai-ts-fullstack \
  --namespace ai-enterprise \
  --create-namespace \
  --values k8s/helm/ai-ts-fullstack/values.yaml \
  --values k8s/helm/ai-ts-fullstack/values-azure.yaml
```

---

## 5. Verifying Ingress & Health

```bash
kubectl get ingress -n ai-enterprise
```
Verify the Application Gateway public IP has bound to `ai.azure.enterprise.com`.
