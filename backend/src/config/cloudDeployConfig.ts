/**
 * @file cloudDeployConfig.ts
 * @description Enterprise Multi-Cloud Configuration Manager.
 * Orchestrates cloud provider profiles, connection string synthesis, deployment manifests,
 * and security postures across Localhost, AWS (ECS/RDS/ElastiCache), Azure (ACA/Flexible Server/Cache),
 * and GCP (Cloud Run/Cloud SQL/Memorystore).
 * @see https://docs.aws.amazon.com/ecs/
 * @see https://learn.microsoft.com/en-us/azure/container-apps/
 * @see https://cloud.google.com/run/docs
 */

import { env } from './env';

export type CloudProvider = 'localhost' | 'aws' | 'azure' | 'gcp';

export interface CloudServiceEndpoints {
  databaseHost: string;
  databasePort: number;
  databaseSsl: boolean;
  redisHost: string;
  redisPort: number;
  redisTls: boolean;
  containerRegistry: string;
  secretsManagerService: string;
}

export interface CloudDeploymentProfile {
  provider: CloudProvider;
  name: string;
  region: string;
  computeService: string;
  databaseService: string;
  cacheService: string;
  endpoints: CloudServiceEndpoints;
  healthCheckPath: string;
  securityRecommendation: string[];
  manifestTemplatePath: string;
}

/**
 * Registry of multi-cloud enterprise architectural profiles.
 */
export const CLOUD_PROFILES: Record<CloudProvider, CloudDeploymentProfile> = {
  localhost: {
    provider: 'localhost',
    name: 'Local Docker Compose Multi-Container Stack',
    region: 'local',
    computeService: 'Docker Engine / Docker Compose',
    databaseService: 'PostgreSQL 16 with pgvector (pgvector/pgvector:pg16)',
    cacheService: 'Redis 7 Alpine',
    endpoints: {
      databaseHost: env.DB_HOST || 'localhost',
      databasePort: env.DB_PORT || 5432,
      databaseSsl: false,
      redisHost: env.REDIS_HOST || 'localhost',
      redisPort: env.REDIS_PORT || 6379,
      redisTls: false,
      containerRegistry: 'local-docker-daemon',
      secretsManagerService: '.env local file',
    },
    healthCheckPath: '/api/admin/health',
    securityRecommendation: [
      'Ensure ports 5432 and 6379 are not exposed publicly in router/firewall',
      'Use strong localized JWT secrets in development',
    ],
    manifestTemplatePath: 'deployment/localhost/docker-compose.yml',
  },
  aws: {
    provider: 'aws',
    name: 'Amazon Web Services (AWS) Enterprise Serverless Container Stack',
    region: env.AWS_REGION || 'us-east-1',
    computeService: 'AWS ECS Fargate (Elastic Container Service)',
    databaseService: 'AWS RDS for PostgreSQL 16 with pgvector extension enabled',
    cacheService: 'AWS ElastiCache for Redis (In-transit and at-rest encryption enabled)',
    endpoints: {
      databaseHost: `ai-ts-db-cluster.${env.AWS_REGION}.rds.amazonaws.com`,
      databasePort: 5432,
      databaseSsl: true,
      redisHost: `ai-ts-redis-cluster.${env.AWS_REGION}.cache.amazonaws.com`,
      redisPort: 6379,
      redisTls: true,
      containerRegistry: `012345678912.dkr.ecr.${env.AWS_REGION}.amazonaws.com/ai-ts-backend`,
      secretsManagerService: 'AWS Secrets Manager & AWS KMS',
    },
    healthCheckPath: '/api/admin/health',
    securityRecommendation: [
      'Enforce IAM Task Role with minimum privilege for S3 and Bedrock access',
      'Place RDS and ElastiCache in isolated private VPC subnets with Security Group restrictions',
      'Deploy AWS WAF in front of Application Load Balancer to mitigate DDoS and SQLi',
      'Enable pgvector HNSW indexing inside RDS parameter group',
    ],
    manifestTemplatePath: 'deployment/aws/ecs-task-definition.json',
  },
  azure: {
    provider: 'azure',
    name: 'Microsoft Azure Container Apps & Managed Database Architecture',
    region: env.AZURE_LOCATION || 'eastus',
    computeService: 'Azure Container Apps (ACA) with Dapr sidecars',
    databaseService: 'Azure Database for PostgreSQL Flexible Server (pgvector enabled)',
    cacheService: 'Azure Cache for Redis (Premium with clustering)',
    endpoints: {
      databaseHost: `ai-ts-postgres.${env.AZURE_LOCATION}.postgres.database.azure.com`,
      databasePort: 5432,
      databaseSsl: true,
      redisHost: `ai-ts-cache.${env.AZURE_LOCATION}.redis.cache.windows.net`,
      redisPort: 6380,
      redisTls: true,
      containerRegistry: 'aitsenterprise.azurecr.io/backend',
      secretsManagerService: 'Azure Key Vault with Managed Identity',
    },
    healthCheckPath: '/api/admin/health',
    securityRecommendation: [
      'Use Azure Managed Identities (MSI) to eliminate hardcoded credentials',
      'Configure Private Endpoints (Azure Private Link) for Postgres and Redis',
      'Deploy Azure Front Door with Web Application Firewall (WAF) premium rules',
      'Configure auto-scaling triggers based on HTTP concurrency and CPU utilization',
    ],
    manifestTemplatePath: 'deployment/azure/azure-container-apps.yaml',
  },
  gcp: {
    provider: 'gcp',
    name: 'Google Cloud Platform (GCP) Cloud Run & Cloud SQL Stack',
    region: env.GCP_REGION || 'us-central1',
    computeService: 'Google Cloud Run (Fully managed serverless containers)',
    databaseService: 'GCP Cloud SQL for PostgreSQL 16 (pgvector flag enabled)',
    cacheService: 'GCP Memorystore for Redis (VPC connector enabled)',
    endpoints: {
      databaseHost: `/cloudsql/my-project:${env.GCP_REGION}:ai-ts-db`,
      databasePort: 5432,
      databaseSsl: true,
      redisHost: `10.0.0.3`,
      redisPort: 6379,
      redisTls: true,
      containerRegistry: `${env.GCP_REGION}-docker.pkg.dev/my-project/ai-repo/backend`,
      secretsManagerService: 'Google Secret Manager',
    },
    healthCheckPath: '/api/admin/health',
    securityRecommendation: [
      'Connect to Cloud SQL strictly through the Cloud SQL Auth Proxy or Serverless VPC Access',
      'Store sensitive tokens inside Google Secret Manager and mount as container environment variables',
      'Enable Cloud Armor security policies to prevent layer 7 DDoS and prompt injection floods',
      'Configure IAM service account with roles/cloudsql.client and roles/secretmanager.secretAccessor',
    ],
    manifestTemplatePath: 'deployment/gcp/cloud-run-service.yaml',
  },
};

/**
 * Cloud Configuration Manager Class.
 * Inspects runtime environment and provides operational manifests.
 */
export class CloudConfigManager {
  private currentProvider: CloudProvider;

  constructor(provider?: CloudProvider) {
    this.currentProvider = provider || (env.CLOUD_PROVIDER as CloudProvider) || 'localhost';
  }

  /**
   * Retrieves the active deployment profile.
   * @returns Active CloudDeploymentProfile
   */
  public getActiveProfile(): CloudDeploymentProfile {
    return CLOUD_PROFILES[this.currentProvider] || CLOUD_PROFILES.localhost;
  }

  /**
   * Generates dynamic connection credentials hint based on provider.
   */
  public getConnectionDiagnostics(): {
    provider: string;
    targetDatabase: string;
    targetRedis: string;
    sslRequired: boolean;
    manifestLocation: string;
  } {
    const profile = this.getActiveProfile();
    return {
      provider: profile.name,
      targetDatabase: `${profile.endpoints.databaseHost}:${profile.endpoints.databasePort}`,
      targetRedis: `${profile.endpoints.redisHost}:${profile.endpoints.redisPort}`,
      sslRequired: profile.endpoints.databaseSsl,
      manifestLocation: profile.manifestTemplatePath,
    };
  }
}

export const cloudManager = new CloudConfigManager();
