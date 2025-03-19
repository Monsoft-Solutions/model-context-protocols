# Deployment Guide

[TOC]

This document provides comprehensive instructions for deploying the MCP Online Platform in various environments, from development to production. It covers infrastructure setup, configuration, security considerations, and maintenance procedures.

## Deployment Architecture

The MCP Online Platform is designed as a containerized microservices application that can be deployed in various cloud environments. The recommended production deployment architecture is as follows:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Kubernetes Cluster                         │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │             │  │             │  │             │             │
│  │  Ingress    │  │  API        │  │  MCP        │             │
│  │  Controller │──│  Gateway    │──│  Router     │             │
│  │             │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └──────┬──────┘             │
│         │                                  │                    │
│         │                                  │                    │
│         │            ┌─────────────┐  ┌────▼───────┐           │
│         │            │             │  │            │           │
│         └────────────│  Auth       │  │  MCP       │           │
│                      │  Service    │  │  Services  │           │
│                      │             │  │            │           │
│                      └─────────────┘  └────────────┘           │
│                             │               │                   │
│                             │               │                   │
│                      ┌──────▼───────────────▼──────┐           │
│                      │                             │           │
│                      │  Logging & Monitoring       │           │
│                      │                             │           │
│                      └───────────────┬─────────────┘           │
│                                      │                         │
└──────────────────────────────────────┼─────────────────────────┘
                                       │
                                       │
           ┌────────────────────────────────────────────┐
           │                                            │
           │               Supabase                     │
           │                                            │
           └────────────────────────────────────────────┘
```

## Prerequisites

Before deploying the MCP Online Platform, ensure the following prerequisites are met:

### Development Environment

- Node.js 16.x or higher
- Docker and Docker Compose
- Git
- Supabase CLI
- PostgreSQL client tools

### Production Environment

- Kubernetes cluster (EKS, GKE, AKS, or self-managed)
- Helm
- Supabase account or self-hosted instance
- Domain name and SSL certificates
- CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins, etc.)
- Infrastructure as Code tools (Terraform, Pulumi, etc.)

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/monsoft-solutions/mcp-online-platform.git
cd mcp-online-platform
```

### Step 2: Set Up Environment Variables

Create a `.env` file based on the template:

```bash
cp .env.example .env
```

Edit the `.env` file with appropriate values:

```
# API Configuration
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>

# JWT Configuration
JWT_SECRET=your-development-secret
JWT_EXPIRY=86400

# Logging Configuration
LOG_LEVEL=debug
```

### Step 3: Start Local Supabase

```bash
supabase start
```

### Step 4: Run Database Migrations

```bash
npm run migrate
```

### Step 5: Start Development Server

```bash
npm run dev
```

The development server will be available at `http://localhost:3000`.

## Staging Environment Deployment

The staging environment should mirror the production environment as closely as possible but with lower resource allocations.

### Step 1: Create Staging Infrastructure

Using Terraform:

```bash
cd terraform
terraform workspace select staging
terraform apply -var-file=staging.tfvars
```

This creates:

- Kubernetes cluster
- Supabase instance (or managed database)
- Supporting infrastructure (networking, security groups, etc.)

### Step 2: Configure Kubernetes Context

```bash
aws eks update-kubeconfig --name mcp-staging-cluster --region us-west-2
# or for GCP
gcloud container clusters get-credentials mcp-staging-cluster --region us-central1
```

### Step 3: Deploy Application with Helm

```bash
cd helm
helm upgrade --install mcp-platform ./mcp-platform -f values-staging.yaml
```

The `values-staging.yaml` file contains staging-specific configuration values.

## Production Deployment

### Step 1: Create Production Infrastructure

Using Terraform:

```bash
cd terraform
terraform workspace select production
terraform apply -var-file=production.tfvars
```

### Step 2: Configure Kubernetes Context

```bash
aws eks update-kubeconfig --name mcp-production-cluster --region us-west-2
```

### Step 3: Deploy Application with Helm

```bash
cd helm
helm upgrade --install mcp-platform ./mcp-platform -f values-production.yaml
```

### Step 4: Verify Deployment

```bash
kubectl get pods -n mcp-platform
kubectl get services -n mcp-platform
```

## Kubernetes Configuration

The platform uses Kubernetes for orchestration with the following resources:

### Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
    name: mcp-platform
```

### Deployments

Example API Gateway deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: api-gateway
    namespace: mcp-platform
spec:
    replicas: 3
    selector:
        matchLabels:
            app: api-gateway
    template:
        metadata:
            labels:
                app: api-gateway
        spec:
            containers:
                - name: api-gateway
                  image: ${ECR_REPO}/api-gateway:${VERSION}
                  ports:
                      - containerPort: 3000
                  env:
                      - name: NODE_ENV
                        value: 'production'
                      - name: PORT
                        value: '3000'
                      - name: SUPABASE_URL
                        valueFrom:
                            secretKeyRef:
                                name: supabase-credentials
                                key: url
                      - name: SUPABASE_SERVICE_KEY
                        valueFrom:
                            secretKeyRef:
                                name: supabase-credentials
                                key: service_key
                  resources:
                      limits:
                          cpu: '1'
                          memory: '1Gi'
                      requests:
                          cpu: '500m'
                          memory: '512Mi'
                  livenessProbe:
                      httpGet:
                          path: /health
                          port: 3000
                      initialDelaySeconds: 30
                      periodSeconds: 10
                  readinessProbe:
                      httpGet:
                          path: /ready
                          port: 3000
                      initialDelaySeconds: 5
                      periodSeconds: 5
```

### Services

```yaml
apiVersion: v1
kind: Service
metadata:
    name: api-gateway
    namespace: mcp-platform
spec:
    selector:
        app: api-gateway
    ports:
        - port: 80
          targetPort: 3000
    type: ClusterIP
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
    name: mcp-platform-ingress
    namespace: mcp-platform
    annotations:
        kubernetes.io/ingress.class: nginx
        cert-manager.io/cluster-issuer: letsencrypt-prod
        nginx.ingress.kubernetes.io/ssl-redirect: 'true'
spec:
    tls:
        - hosts:
              - api.mcpplatform.example.com
          secretName: mcp-platform-tls
    rules:
        - host: api.mcpplatform.example.com
          http:
              paths:
                  - path: /
                    pathType: Prefix
                    backend:
                        service:
                            name: api-gateway
                            port:
                                number: 80
```

## Database Setup

### Supabase Configuration

The platform uses Supabase for database and authentication. Follow these steps to set up Supabase:

1. **Create Schema and Tables**:

    ```sql
    -- Create schema
    CREATE SCHEMA mcp_platform;

    -- Enable RLS
    ALTER TABLE mcp_platform.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE mcp_platform.user_tokens ENABLE ROW LEVEL SECURITY;
    ALTER TABLE mcp_platform.request_logs ENABLE ROW LEVEL SECURITY;
    ```

2. **Set Up Row Level Security Policies**:

    ```sql
    -- Users can only see their own data
    CREATE POLICY "Users can only see their own profile"
      ON mcp_platform.users
      FOR SELECT
      USING (auth.uid() = id);

    -- Users can only access their own tokens
    CREATE POLICY "Users can only access their own tokens"
      ON mcp_platform.user_tokens
      FOR ALL
      USING (auth.uid() = user_id);
    ```

3. **Create Database Functions**:

    ```sql
    -- Function to get current user's tokens
    CREATE OR REPLACE FUNCTION mcp_platform.get_user_tokens()
    RETURNS TABLE (
      id UUID,
      service_name TEXT,
      created_at TIMESTAMP,
      last_used_at TIMESTAMP
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT ut.id, ut.service_name, ut.created_at, ut.last_used_at
      FROM mcp_platform.user_tokens ut
      WHERE ut.user_id = auth.uid();
    END;
    $$;
    ```

## Security Configuration

### SSL/TLS Setup

1. **Install cert-manager**:

    ```bash
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.10.0/cert-manager.yaml
    ```

2. **Create ClusterIssuer for Let's Encrypt**:

    ```yaml
    apiVersion: cert-manager.io/v1
    kind: ClusterIssuer
    metadata:
        name: letsencrypt-prod
    spec:
        acme:
            server: https://acme-v02.api.letsencrypt.org/directory
            email: admin@mcpplatform.example.com
            privateKeySecretRef:
                name: letsencrypt-prod-key
            solvers:
                - http01:
                      ingress:
                          class: nginx
    ```

### Kubernetes Secrets

Store sensitive information in Kubernetes secrets:

```bash
kubectl create secret generic supabase-credentials \
  --from-literal=url=https://your-project.supabase.co \
  --from-literal=anon_key=your-anon-key \
  --from-literal=service_key=your-service-key \
  -n mcp-platform
```

## CI/CD Pipeline

The platform uses GitHub Actions for continuous integration and deployment:

### Build and Test Workflow

```yaml
name: Build and Test

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main, develop]

jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - name: Use Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: '16'
                  cache: 'npm'
            - run: npm ci
            - run: npm run build
            - run: npm test
            - name: Run linting
              run: npm run lint
```

### Deployment Workflow

```yaml
name: Deploy

on:
    push:
        branches: [main]
        paths-ignore:
            - 'docs/**'
            - '**.md'

jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3

            - name: Configure AWS credentials
              uses: aws-actions/configure-aws-credentials@v1
              with:
                  aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
                  aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
                  aws-region: us-west-2

            - name: Login to Amazon ECR
              id: login-ecr
              uses: aws-actions/amazon-ecr-login@v1

            - name: Build, tag, and push image to Amazon ECR
              env:
                  ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
                  ECR_REPOSITORY: mcp-platform
                  IMAGE_TAG: ${{ github.sha }}
              run: |
                  docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
                  docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

            - name: Update kube config
              run: aws eks update-kubeconfig --region us-west-2 --name mcp-production-cluster

            - name: Deploy to EKS
              run: |
                  helm upgrade --install mcp-platform ./helm/mcp-platform \
                    --set image.repository=${{ steps.login-ecr.outputs.registry }}/mcp-platform \
                    --set image.tag=${{ github.sha }} \
                    -f ./helm/mcp-platform/values-production.yaml
```

## Monitoring and Logging

### Prometheus Setup

Install Prometheus Operator:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

### Grafana Dashboards

Create dashboards for monitoring:

1. API Gateway Performance
2. MCP Service Performance
3. Database Metrics
4. Error Rates
5. Authentication Metrics

### ELK Stack for Logging

Deploy the ELK stack for centralized logging:

```bash
helm repo add elastic https://helm.elastic.co
helm repo update
helm install elasticsearch elastic/elasticsearch \
  --namespace logging \
  --create-namespace

helm install kibana elastic/kibana \
  --namespace logging

helm install filebeat elastic/filebeat \
  --namespace logging
```

## Backup and Disaster Recovery

### Database Backups

Configure automated backups for Supabase:

1. **Enable Point-in-Time Recovery**:
   Enable this feature in the Supabase dashboard.

2. **Schedule Regular Backups**:
    ```bash
    # For self-hosted Supabase
    kubectl create cronjob postgres-backup --schedule="0 2 * * *" \
      --image=postgres \
      -- /bin/sh -c "pg_dump -U postgres -h postgres-db > /backup/db-\$(date +%Y-%m-%d).sql"
    ```

### Disaster Recovery Plan

1. **Infrastructure Recovery**:

    - Store Terraform state in a remote backend
    - Document manual recovery procedures
    - Regularly test recovery process

2. **Data Recovery**:

    - Restore from latest backup
    - Apply transaction logs for point-in-time recovery
    - Validate data integrity after recovery

3. **Application Recovery**:
    - Deploy from known good container images
    - Verify service connectivity
    - Run health checks and validation tests

## Scaling Considerations

### Horizontal Scaling

Configure horizontal pod autoscaling:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
    name: api-gateway-hpa
    namespace: mcp-platform
spec:
    scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: api-gateway
    minReplicas: 3
    maxReplicas: 10
    metrics:
        - type: Resource
          resource:
              name: cpu
              target:
                  type: Utilization
                  averageUtilization: 70
```

### Database Scaling

1. **Connection Pooling**:

    - Use PgBouncer for connection pooling
    - Configure appropriate pool sizes

2. **Read Replicas**:
    - Set up read replicas for query-heavy workloads
    - Implement read/write splitting in application

## Maintenance Procedures

### Rolling Updates

Perform zero-downtime updates:

```bash
kubectl set image deployment/api-gateway api-gateway=${ECR_REPO}/api-gateway:${NEW_VERSION} -n mcp-platform
```

### Database Migrations

Run migrations safely:

1. **Backup Database**:

    ```bash
    pg_dump -U postgres -h ${DB_HOST} > backup.sql
    ```

2. **Apply Migration**:

    ```bash
    npm run migrate
    ```

3. **Verify Migration**:
    ```bash
    npm run migration:verify
    ```

### Routine Maintenance

1. **Certificate Rotation**:

    - Monitor certificate expiration
    - Automate renewal with cert-manager

2. **Security Updates**:

    - Regularly update base images
    - Apply security patches promptly

3. **Performance Tuning**:
    - Monitor and adjust resource allocations
    - Optimize database queries

## Troubleshooting

### Common Issues

1. **Pod Startup Failures**:

    - Check pod logs: `kubectl logs -n mcp-platform <pod-name>`
    - Verify environment variables and secrets

2. **Database Connectivity Issues**:

    - Check network policies
    - Verify connection strings and credentials

3. **Authentication Problems**:
    - Validate JWT configuration
    - Check Supabase auth settings

### Debugging Tools

1. **Interactive Debugging**:

    ```bash
    kubectl exec -it -n mcp-platform <pod-name> -- /bin/sh
    ```

2. **Log Analysis**:

    - Use Kibana for log searching and visualization
    - Filter logs by correlation ID

3. **Network Debugging**:
    ```bash
    kubectl run -n mcp-platform network-debug --rm -i --tty --image=nicolaka/netshoot -- /bin/bash
    ```

## Reference Configurations

### Kubernetes Resource Requirements

| Component       | CPU Request | CPU Limit | Memory Request | Memory Limit |
| --------------- | ----------- | --------- | -------------- | ------------ |
| API Gateway     | 500m        | 1         | 512Mi          | 1Gi          |
| Auth Service    | 250m        | 500m      | 256Mi          | 512Mi        |
| MCP Router      | 250m        | 500m      | 256Mi          | 512Mi        |
| MCP Services    | 500m        | 1         | 512Mi          | 1Gi          |
| Logging Service | 250m        | 500m      | 512Mi          | 1Gi          |

### Production Environment Variables

```
# API Configuration
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.mcpplatform.example.com

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# JWT Configuration
JWT_SECRET=your-secure-secret
JWT_EXPIRY=86400

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
```

## Versioning and Release Strategy

### Semantic Versioning

The platform follows semantic versioning (MAJOR.MINOR.PATCH):

- MAJOR: Incompatible API changes
- MINOR: Backward-compatible new features
- PATCH: Backward-compatible bug fixes

### Release Process

1. **Pre-release Validation**:

    - Full test suite execution
    - Security scanning
    - Performance testing

2. **Release Approval**:

    - Code review sign-off
    - Product owner approval
    - Security team approval

3. **Deployment Process**:

    - Deploy to staging environment
    - Conduct smoke tests
    - Deploy to production with monitoring
    - Verify successful deployment

4. **Rollback Procedure**:
    - Identify rollback trigger criteria
    - Execute rollback command if needed: `helm rollback mcp-platform`
    - Notify stakeholders of issues
