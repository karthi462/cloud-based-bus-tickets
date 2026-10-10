# CloudBus — Cloud Computing Architecture & System Design

## 1. System Overview

**CloudBus — Smart Fingerprint Ticketing & Travel Credit System** is a cloud-native, full-stack transit ticketing platform built using serverless AWS microservices, biometric passkeys (WebAuthn/FIDO2 standard and classroom simulation), role-based access control, digital stored-value wallets, automated verifiable digital ticket issuance, and emergency travel credit.

---

## 2. Cloud Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Devices (Mobile / Tablet / Desktop)"]
        PassengerApp["Passenger Portal (React SPA)"]
        ConductorApp["Conductor POS Terminal (React SPA)"]
        AdminConsole["Admin Console (React SPA)"]
    end

    subgraph ContentDelivery ["Global Content Delivery & Edge Security"]
        CloudFront["Amazon CloudFront (CDN + HTTPS)"]
        S3Static["Amazon S3 Bucket (Static Web Assets)"]
    end

    subgraph ApiLayer ["API & Ingress Layer"]
        ApiGateway["Amazon API Gateway (HTTP API)"]
        SecretsMgr["AWS Secrets Manager (JWT & HMAC Secrets)"]
    end

    subgraph ComputeLayer ["Serverless Compute Layer"]
        LambdaApi["AWS Lambda (Node.js/TypeScript Engine)"]
    end

    subgraph StorageLayer ["High-Performance Database Layer"]
        DDB_Users["DynamoDB: Users Table"]
        DDB_Profiles["DynamoDB: Passenger & Conductor Profiles"]
        DDB_Wallets["DynamoDB: Wallets & Immutable Ledger"]
        DDB_Credit["DynamoDB: CreditAccounts Table"]
        DDB_Tickets["DynamoDB: Tickets Table"]
        DDB_Fleet["DynamoDB: Buses, Routes, Stops & Rules"]
        DDB_Audit["DynamoDB: AuditLogs Table"]
    end

    subgraph Monitoring ["Observability & Auditing"]
        CloudWatchLogs["Amazon CloudWatch Logs"]
        CloudWatchAlarms["CloudWatch Error & Latency Alarms"]
    end

    %% Flows
    PassengerApp -->|HTTPS / DNS| CloudFront
    ConductorApp -->|HTTPS / DNS| CloudFront
    AdminConsole -->|HTTPS / DNS| CloudFront
    CloudFront -->|Origin Request| S3Static

    PassengerApp -->|REST API Requests| ApiGateway
    ConductorApp -->|Ticketing & Auth API| ApiGateway
    AdminConsole -->|Management APIs| ApiGateway

    ApiGateway -->|Proxy Integration| LambdaApi
    SecretsMgr -.->|Decryption Keys| LambdaApi

    LambdaApi -->|TransactWriteItems / PutItem| DDB_Wallets
    LambdaApi -->|TransactWriteItems / PutItem| DDB_Credit
    LambdaApi -->|TransactWriteItems / PutItem| DDB_Tickets
    LambdaApi -->|Query / PutItem| DDB_Users
    LambdaApi -->|Query / Scan| DDB_Profiles
    LambdaApi -->|Query / Scan| DDB_Fleet
    LambdaApi -->|PutItem| DDB_Audit

    LambdaApi -->|Telemetry Streams| CloudWatchLogs
    CloudWatchLogs --> CloudWatchAlarms
```

---

## 3. AWS Cloud Services Breakdown & Responsibilities

| AWS Service | Architectural Role | Specific Responsibility in CloudBus |
| :--- | :--- | :--- |
| **Amazon S3** | Object Storage | Hosts compiled React static assets (`index.html`, JavaScript bundles, CSS, icons) with strict public access blocks. |
| **Amazon CloudFront** | CDN & Edge Security | Delivers frontend static assets globally over low-latency HTTPS edge nodes, enforcing modern TLS 1.3 encryption. |
| **Amazon API Gateway** | API Management | Exposes HTTP endpoints (`/api/*`), manages CORS, handles TLS termination, request throttling, and payload sizing. |
| **AWS Lambda** | Serverless Compute | Executes backend business logic, JWT session validation, WebAuthn challenge generation/verification, route stop distance calculations, and atomic financial transactions. |
| **Amazon DynamoDB** | NoSQL Data Persistence | High-performance, low-latency persistent database. Uses `TransactWriteItems` to guarantee atomic ticket issuance, wallet deductions, and credit advancements without race conditions. |
| **AWS Secrets Manager** | Secret Configuration | Securely stores JWT signing keys and HMAC ticket signature secrets; resolved automatically at deployment time. |
| **Amazon CloudWatch** | Monitoring & Alerts | Aggregates structured JSON logs, system latency metrics, 5xx error alarms, and security audit events. |
| **AWS IAM** | Identity & Access Mgmt | Enforces least-privilege role policies so the Lambda function can only access its designated DynamoDB tables and CloudWatch log groups. |

---

## 4. Biometric Authentication & Cryptographic Flow

```mermaid
sequenceDiagram
    autonumber
    actor Passenger
    actor Conductor
    participant Terminal as Conductor Terminal
    participant Server as CloudBus API (Lambda)
    participant DB as DynamoDB

    Conductor->>Terminal: Selects Bus (BUS-01), Driver (DRV-101), Route (R-101)
    Conductor->>Terminal: Inputs Passenger ID (CB-PASS-1001)
    Terminal->>Server: GET /api/biometrics/demo-challenge/:passengerId
    Server->>Server: Generate Cryptographic Biometric Challenge
    Server-->>Terminal: Return Challenge Token + Expiry
    Passenger->>Terminal: Scans Fingerprint (WebAuthn / Classroom Simulation)
    Terminal->>Server: POST /api/biometrics/demo-verify (passengerId, challenge)
    Server->>Server: Verify challenge signature & timestamp
    Server->>DB: Query passenger profile, wallet balance, and credit limit
    Server-->>Terminal: Verification Confirmed + Passenger Financial Snapshot
    Conductor->>Terminal: Selects Boarding & Destination Stops
    Terminal->>Server: GET /api/tickets/fare-preview (route, stops)
    Server-->>Terminal: Calculated Fare (e.g. ₹35)
    Conductor->>Terminal: Confirm & Issue Ticket
    Terminal->>Server: POST /api/tickets/generate (atomic payload)
    Server->>DB: TransactWriteItems (Create Ticket + Debit Wallet OR Advance Credit + Log Ledger)
    Server-->>Terminal: Signed Digital Ticket + HMAC Signature + QR Payload
    Terminal->>Passenger: Displays Verifiable Digital QR Pass
```

---

## 5. Cost Breakdown & AWS Free Tier Limitations

CloudBus is engineered to run entirely within the **AWS Free Tier**:

| AWS Service | Free Tier Allowance | CloudBus Usage Profile | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- |
| **AWS Lambda** | 1,000,000 requests / month + 3.2M seconds compute | ~100,000 requests/month | **\$0.00** |
| **Amazon DynamoDB** | 25 GB storage + 25 Read / Write Capacity Units | ~1 GB data storage (PAY_PER_REQUEST) | **\$0.00** |
| **Amazon API Gateway** | 1,000,000 HTTP API calls / month (first 12 months) | ~100,000 calls/month | **\$0.00** |
| **Amazon CloudFront** | 1 TB data transfer out / month | ~5 GB data transfer | **\$0.00** |
| **Amazon S3** | 5 GB standard storage + 20,000 GET requests | < 50 MB build assets | **\$0.00** |
| **Amazon CloudWatch** | 5 GB log data ingestion + 10 metrics alarms | ~500 MB log data | **\$0.00** |
| **Total Estimated Run Cost** | | | **\$0.00 / month** (Within Free Tier) |
