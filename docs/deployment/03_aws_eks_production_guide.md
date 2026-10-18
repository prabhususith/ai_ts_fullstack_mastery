# Volume 03: AWS EKS Production Deployment Guide

**Target Environment:** Amazon Elastic Kubernetes Service (EKS)  
**Tools Required:** `aws-cli`, `eksctl`, `kubectl`, `helm`  
**Infrastructure Target:** Managed EKS NodeGroups, AWS ALB Controller, IAM Roles for Service Accounts (IRSA), External RDS PostgreSQL (pgvector), AWS ElastiCache

---

## 1. Cluster Provisioning with `eksctl`

Create a production-grade EKS cluster across multiple availability zones with OIDC identity mapping enabled:

```yaml
# cluster-eks.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: ai-enterprise-eks
  region: us-east-1
  version: "1.30"

iam:
  withOIDC: true

managedNodeGroups:
  - name: ai-workload-nodes
    instanceType: m6i.xlarge
    minSize: 3
    maxSize: 10
    desiredCapacity: 3
    volumeSize: 100
    volumeType: gp3
    privateNetworking: true
    labels:
      role: ai-application
    tags:
      Environment: Production
      Project: AI-FullStack-Mastery
```

Execute cluster creation:
```bash
eksctl create cluster -f cluster-eks.yaml
```

---

## 2. Setting Up AWS Load Balancer Controller & Ingress

1. Associate IAM OIDC provider:
   ```bash
   eksctl utils associate-iam-oidc-provider --cluster ai-enterprise-eks --approve
   ```

2. Download IAM policy for AWS Load Balancer Controller:
   ```bash
   curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json
   aws iam create-policy \
     --policy-name AWSLoadBalancerControllerIAMPolicy \
     --policy-document file://iam_policy.json
   ```

3. Create IAM Service Account (IRSA):
   ```bash
   eksctl create iamserviceaccount \
     --cluster=ai-enterprise-eks \
     --namespace=kube-system \
     --name=aws-load-balancer-controller \
     --role-name AmazonEKSLoadBalancerControllerRole \
     --attach-policy-arn=arn:aws:iam::012345678912:policy/AWSLoadBalancerControllerIAMPolicy \
     --approve
   ```

4. Install Controller via Helm:
   ```bash
   helm repo add eks https://aws.github.io/eks-charts
   helm repo update
   helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
     -n kube-system \
     --set clusterName=ai-enterprise-eks \
     --set serviceAccount.create=false \
     --set serviceAccount.name=aws-load-balancer-controller
   ```

---

## 3. Provisioning External RDS PostgreSQL with pgvector

In enterprise AWS deployments, database persistence is offloaded to Amazon RDS for PostgreSQL rather than in-cluster StatefulSets:

1. Create a custom RDS parameter group with `shared_preload_libraries=vector`:
   ```bash
   aws rds create-db-parameter-group \
     --db-parameter-group-name rds-pgvector-pg16 \
     --db-parameter-group-family postgres16 \
     --description "Enables pgvector extension"

   aws rds modify-db-parameter-group \
     --db-parameter-group-name rds-pgvector-pg16 \
     --parameters "ParameterName=shared_preload_libraries,ParameterValue=vector,ApplyMethod=pending-reboot"
   ```

2. Provision Multi-AZ RDS instance in private VPC subnets:
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier ai-enterprise-rds-prod \
     --db-instance-class db.r6g.xlarge \
     --engine postgres \
     --engine-version 16.2 \
     --master-username postgresadmin \
     --master-user-password "YourSecurePasswordHere" \
     --allocated-storage 100 \
     --db-parameter-group-name rds-pgvector-pg16 \
     --multi-az \
     --no-publicly-accessible
   ```

---

## 4. Deploying the Application via Helm 3 (AWS Overrides)

```bash
# Push container images to Amazon ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 012345678912.dkr.ecr.us-east-1.amazonaws.com
docker tag ai-ts-backend:latest 012345678912.dkr.ecr.us-east-1.amazonaws.com/ai-ts-backend:v1.0.0
docker tag ai-ts-frontend:latest 012345678912.dkr.ecr.us-east-1.amazonaws.com/ai-ts-frontend:v1.0.0
docker push 012345678912.dkr.ecr.us-east-1.amazonaws.com/ai-ts-backend:v1.0.0
docker push 012345678912.dkr.ecr.us-east-1.amazonaws.com/ai-ts-frontend:v1.0.0

# Deploy using AWS production values
helm upgrade --install ai-fullstack k8s/helm/ai-ts-fullstack \
  --namespace ai-enterprise \
  --create-namespace \
  --values k8s/helm/ai-ts-fullstack/values.yaml \
  --values k8s/helm/ai-ts-fullstack/values-aws.yaml
```

---

## 5. Verifying the Application Load Balancer

```bash
# Verify ALB Ingress status and external DNS address
kubectl get ingress -n ai-enterprise
```
Output will display the Amazon ALB DNS record:
```
NAME             CLASS   HOSTS                      ADDRESS                                                                  PORTS
aws-alb-ingress  alb     ai.aws.enterprise.com      k8s-aienterp-awsalbin-1234567890.us-east-1.elb.amazonaws.com            80, 443
```
Point your Route53 Hosted Zone Alias record to this ALB DNS name.
