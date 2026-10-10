# CloudBus — Smart Fingerprint Ticketing & Travel Credit System

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![AWS Serverless](https://img.shields.io/badge/AWS-Lambda%20%2B%20DynamoDB-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Tests](https://img.shields.io/badge/Tests-23%20Passed-10B981)](#-testing-verification)

A modern, responsive, cloud-based public bus ticketing platform demonstrating **cloud computing, biometric authentication, role-based access control (RBAC), digital transit wallets, automated digital ticket generation, and emergency travel credit**.

---

## 🌟 Key Capabilities

1. **Biometric Authentication & Passkey Standards:**
   - WebAuthn / FIDO2 standard using device biometric sensors (Touch ID, Windows Hello, Android Biometrics).
   - Dedicated **"DEMO — Simulated Fingerprint Authentication"** mode with live animated laser beam scanner for classroom presentations.
   - **Zero Raw Fingerprint Images Stored:** Complies with privacy principles by storing only cryptographic public-key credential metadata and server-signed challenges.

2. **Emergency Travel Credit Engine:**
   - Commuter safety net with a configurable ₹200 limit.
   - Automatically advances travel credit if a passenger's wallet balance is insufficient.
   - Rejects transactions that would push credit owed beyond the limit (e.g. ₹190 owed + ₹35 fare > ₹200 limit is cleanly blocked).
   - Seamless repayment when the passenger tops up their transit wallet.

3. **Verifiable Digital QR Ticketing:**
   - Conductor Point-of-Sale terminal with assigned driver, bus, and route stops.
   - Stop sequence and route direction enforcement.
   - Atomic database write (`TransactWriteItems`) linking ticket issuance, wallet deduction, and ledger updates.
   - Cryptographically signed HMAC-SHA256 verifiable QR passes with duplicate validation protection.

4. **Role-Based Portals & Access Control:**
   - **Passenger Portal:** Digital wallet, transaction ledger, credit meter, journey history, and passkey enrolment.
   - **Conductor Terminal:** Dedicated Employee ID sign-in, shift statistics, ticket issuance wizard, and QR pass validator.
   - **Administrator Console:** Real-time transport telemetry, passenger accounts, credit limits, fleet and crew management, pricing rules, and security audit logs.

---

## 🔑 Pre-Seeded Academic Demo Accounts

CloudBus comes pre-loaded with demonstration scenarios ready for immediate testing:

| Role | Identifier / Email | Password | Scenario / Characteristics |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@cloudbus.gov` | `admin123` | Full administrative rights, audit logs, credit limits |
| **Conductor** | `CB-EMP-2001` | `conductor123` | Assigned to Bus `KA-01-F-4022`, Route `R-101` (Majestic → E-City) |
| **Passenger #1** | `passenger@cloudbus.com` | `pass123` | ID `CB-PASS-1001`, **₹100 Wallet Balance**, ₹0 Credit (Funded Travel) |
| **Passenger #2** | `emergency@cloudbus.com` | `pass123` | ID `CB-PASS-1002`, **₹0 Wallet Balance**, ₹200 Credit Buffer (Emergency Credit Advance) |
| **Passenger #3** | `nearlimit@cloudbus.com` | `pass123` | ID `CB-PASS-1003`, **₹0 Wallet, ₹190 Credit Owed** (Tests Credit Limit Exceeded Rejection) |

*Tip: The Landing Page features 1-click test buttons that automatically sign into each profile.*

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** (v20.x or higher)
- **npm** (v10.x or higher)

### 2. Installation
From the project root:
```bash
npm run install:all
```

### 3. Start Backend API Server (Port 5000)
```bash
npm run dev:backend
```
*Health Check:* [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 4. Start Frontend Application (Port 5173)
In a separate terminal:
```bash
npm run dev:frontend
```
*Access the App:* [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing Verification

The project includes an automated test suite executed with Vitest:

```bash
npm run test
```

### Test Results
```text
 ✓ src/tests/cloudbus.test.ts (23 tests)
   ✓ 1. Passenger Registration and Authentication (3 tests)
   ✓ 2. Conductor Employee Login (2 tests)
   ✓ 3. Admin Access Control & Permission Enforcement (3 tests)
   ✓ 4. Biometric & Simulated Fingerprint Mode (3 tests)
   ✓ 5. Route & Stop Sequence Validation (3 tests)
   ✓ 6. Wallet & Emergency Travel Credit Business Rules (5 tests)
     - Scenario 1: Wallet ₹100, fare ₹25 -> Leaves ₹75 in wallet
     - Scenario 2: Wallet ₹0, outstanding ₹0, fare ₹35 -> Advances ₹35 credit
     - Scenario 3: Outstanding credit ₹190, fare ₹35, limit ₹200 -> Cleanly rejected (exceeds limit)
     - Scenario 4: Outstanding credit ₹200 -> Rejects additional travel
     - Scenario 5: Credit Repayment -> Restores credit buffer
   ✓ 7. Duplicate Request Protection & Idempotency (1 test)
   ✓ 8. Withdrawal Management (2 tests)
   ✓ 9. Ticket QR Generation and Cryptographic Validation (1 test)

Test Files: 1 passed (1)
Tests:      23 passed (23)
```

---

## ☁️ Cloud Architecture & Deployment

CloudBus is engineered for serverless deployment on Amazon Web Services:

- **AWS SAM Template:** [aws/template.yaml](file:///c:/Users/Karthick/OneDrive/Desktop/cloud%20based%20bus%20ticketing%20system/aws/template.yaml)
- **IAM Policies:** [aws/iam-policies.json](file:///c:/Users/Karthick/OneDrive/Desktop/cloud%20based%20bus%20ticketing%20system/aws/iam-policies.json)
- **Architecture Specification:** [docs/ARCHITECTURE.md](file:///c:/Users/Karthick/OneDrive/Desktop/cloud%20based%20bus%20ticketing%20system/docs/ARCHITECTURE.md)
- **Database Schema & Access Patterns:** [docs/DATABASE_SCHEMA.md](file:///c:/Users/Karthick/OneDrive/Desktop/cloud%20based%20bus%20ticketing%20system/docs/DATABASE_SCHEMA.md)
- **RESTful API Specification:** [docs/API_DOCUMENTATION.md](file:///c:/Users/Karthick/OneDrive/Desktop/cloud%20based%20bus%20ticketing%20system/docs/API_DOCUMENTATION.md)
- **Deployment Guide:** [docs/DEPLOYMENT_GUIDE.md](file:///c:/Users/Karthick/OneDrive/Desktop/cloud%20based%20bus%20ticketing%20system/docs/DEPLOYMENT_GUIDE.md)

### Deploying to AWS
```bash
# Build backend
cd backend && npm run build && cd ..

# Deploy serverless infrastructure
sam build -t aws/template.yaml
sam deploy --guided --stack-name cloudbus-prod --capabilities CAPABILITY_IAM
```

---

## 📜 Academic Integrity & Privacy Notice

- This project is an academic simulation demonstrating cloud computing architectures and transport technologies.
- Emergency travel credit is an internal transit concession and does not constitute a financial banking loan.
- No raw biometric or physiological fingerprint images are ever captured, transmitted, or stored.
