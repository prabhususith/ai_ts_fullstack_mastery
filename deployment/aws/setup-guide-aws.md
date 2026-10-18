# AWS Enterprise Deployment & Provisioning Guide

## Architecture Overview
The AWS target deployment utilizes:
- **Compute:** AWS ECS Fargate serverless containers running the Node.js Express backend and Vite React frontend.
- **Relational & Vector Database:** AWS RDS for PostgreSQL 16 with the `pgvector` extension enabled for HNSW cosine distance indexing.
- **Cache & Message Broker:** AWS ElastiCache for Redis (in-transit TLS, auth enabled).
- **Security:** AWS Secrets Manager for secret injection, AWS IAM Task Roles for least privilege, and AWS WAF in front of an Application Load Balancer (ALB).

---

## Step 1: Provision RDS PostgreSQL with pgvector

1. Create a custom RDS DB Parameter Group:
   ```bash
   aws rds create-db-parameter-group \
     --db-parameter-group-name custom-pg16-vector \
     --db-parameter-group-family postgres16 \
     --description "Postgres 16 with pgvector parameters"
   ```

2. Modify parameters to support pgvector shared libraries:
   ```bash
   aws rds modify-db-parameter-group \
     --db-parameter-group-name custom-pg16-vector \
     --parameters "ParameterName=shared_preload_libraries,ParameterValue=vector,ApplyMethod=pending-reboot"
   ```

3. Launch the RDS PostgreSQL instance in private VPC subnets:
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier ai-enterprise-rds \
     --db-instance-class db.t4g.large \
     --engine postgres \
     --engine-version 16.2 \
     --master-username postgres \
     --master-user-password "YourHighEntropyPassword" \
     --allocated-storage 50 \
     --db-parameter-group-name custom-pg16-vector \
     --vpc-security-group-ids sg-0123456789abcdef0 \
     --no-publicly-accessible
   ```

4. Connect to database and execute:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

---

## Step 2: Provision AWS ElastiCache for Redis

1. Create a Redis subnet group:
   ```bash
   aws elasticache create-cache-subnet-group \
     --cache-subnet-group-name redis-private-subnets \
     --cache-subnet-group-description "Private subnets for Redis" \
     --subnet-ids subnet-11111111 subnet-22222222
   ```

2. Launch ElastiCache Redis replication group:
   ```bash
   aws elasticache create-replication-group \
     --replication-group-id ai-enterprise-redis \
     --replication-group-description "Semantic vector cache & rate limiting" \
     --engine redis \
     --cache-node-type cache.t4g.medium \
     --num-node-groups 1 \
     --replicas-per-node-group 1 \
     --transit-encryption-enabled \
     --at-rest-encryption-enabled \
     --cache-subnet-group-name redis-private-subnets \
     --security-group-ids sg-0123456789abcdef0
   ```

---

## Step 3: Register Task Definition & Deploy to ECS Fargate

1. Build and push container to Amazon ECR:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 012345678912.dkr.ecr.us-east-1.amazonaws.com
   docker build -t ai-ts-backend:latest ./backend
   docker tag ai-ts-backend:latest 012345678912.dkr.ecr.us-east-1.amazonaws.com/ai-ts-backend:latest
   docker push 012345678912.dkr.ecr.us-east-1.amazonaws.com/ai-ts-backend:latest
   ```

2. Register ECS Task Definition:
   ```bash
   aws ecs register-task-definition --cli-input-json file://deployment/aws/ecs-task-definition.json
   ```

3. Create or update ECS Service:
   ```bash
   aws ecs create-service \
     --cluster ai-enterprise-cluster \
     --service-name ai-backend-service \
     --task-definition ai-enterprise-ecs-task \
     --desired-count 2 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-11111111,subnet-22222222],securityGroups=[sg-0123456789abcdef0],assignPublicIp=DISABLED}" \
     --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:012345678912:targetgroup/ai-backend-tg/12345,containerName=ai-backend,containerPort=5000"
   ```
