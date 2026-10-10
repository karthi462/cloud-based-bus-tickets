# CloudBus — Deployment & Operations Guide

## 1. Local Development Mode (Zero-AWS Dependency)

CloudBus includes a built-in repository layer that allows instant zero-cloud local development without requiring an AWS account or active credentials.

### Prerequisites
- Node.js (v20.x or higher)
- npm (v10.x or higher)

### Setup & Run Commands

1. **Install All Dependencies:**
   ```bash
   npm run install:all
   ```

2. **Run Backend API Server (Port 5000):**
   ```bash
   npm run dev:backend
   ```
   *Health Check URL:* `http://localhost:5000/api/health`

3. **Run Frontend Web Application (Port 5173):**
   ```bash
   npm run dev:frontend
   ```
   *Web App URL:* `http://localhost:5173`

4. **Execute Automated Test Suite:**
   ```bash
   npm run test
   ```
   *Tests all 23 scenarios (fare calculations, credit limits, duplicate deductions, unauthorized access, passkeys).*

---

## 2. Environment Configuration Template

Create `backend/.env` with the following variables:

```env
# Server Port & Environment
PORT=5000
NODE_ENV=development

# Authentication & Cryptographic Keys
JWT_SECRET=cloudbus-super-secret-jwt-key-academic-2026
TICKET_SIGN_SECRET=cloudbus-ticket-hmac-sha256-key-secure

# WebAuthn RP Configuration
RP_NAME=CloudBus Transport Authority
RP_ID=localhost
ORIGIN=http://localhost:5173

# Cloud Configuration (Set to true only when deploying to AWS)
USE_DYNAMODB=false
AWS_REGION=us-east-1
DYNAMODB_TABLE_PREFIX=CloudBus_
```

---

## 3. Production AWS Serverless Deployment

When deploying to AWS using AWS SAM:

### Prerequisites
- AWS CLI configured with least-privilege IAM credentials (`aws configure`)
- AWS SAM CLI installed (`sam --version`)

### Step 1: Build & Package Lambda
```bash
cd backend
npm run build
cd ..
```

### Step 2: Deploy AWS SAM Stack
```bash
sam build -t aws/template.yaml
sam deploy --guided --stack-name cloudbus-prod --capabilities CAPABILITY_IAM
```

This provisions:
- Amazon API Gateway HTTP API
- AWS Lambda functions with ARM64 Graviton runtime
- Amazon DynamoDB tables (PAY_PER_REQUEST billing)
- Amazon S3 bucket for frontend hosting
- Amazon CloudWatch Log Group with high-error alarms

### Step 3: Deploy Frontend SPA to Amazon S3 & CloudFront
```bash
cd frontend
# Set VITE_API_URL to the API Gateway output URL
npm run build
aws s3 sync dist/ s3://<Your-S3-Frontend-Bucket-Name> --delete
aws cloudfront create-invalidation --distribution-id <Your-Distribution-Id> --paths "/*"
```

---

## 4. Rollback and Disaster Recovery

- **SAM Stack Rollback:**
  ```bash
  sam deploy --stack-name cloudbus-prod --resolve-s3
  ```
- **Tear Down AWS Resources (Cleanup):**
  ```bash
  sam delete --stack-name cloudbus-prod
  ```
