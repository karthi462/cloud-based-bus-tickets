# CloudBus — RESTful API Specification

## 1. Authentication & Security Headers

All protected endpoints require a standard Bearer Token header:
```http
Authorization: Bearer <jwt-token>
```
Tokens are generated upon successful login (`/api/auth/login/*`) or registration (`/api/auth/register`) and remain valid for 24 hours.

---

## 2. API Endpoints Catalog

### Authentication (`/api/auth`)

#### `POST /api/auth/register`
Register a new passenger.
- **Request Body:**
  ```json
  {
    "fullName": "Karthick Ramanathan",
    "email": "passenger@cloudbus.com",
    "mobileNumber": "9876543210",
    "password": "pass123",
    "termsConsent": true
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Passenger registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "usr-pass-1",
      "email": "passenger@cloudbus.com",
      "role": "PASSENGER",
      "passengerId": "CB-PASS-1001",
      "fullName": "Karthick Ramanathan"
    }
  }
  ```

#### `POST /api/auth/login/passenger`
Passenger authentication using email and password.

#### `POST /api/auth/login/conductor`
Conductor employee authentication.
- **Request Body:**
  ```json
  {
    "employeeId": "CB-EMP-2001",
    "password": "conductor123"
  }
  ```

#### `POST /api/auth/login/admin`
Administrator authentication using email and master secret.

#### `GET /api/auth/me`
Retrieve currently authenticated user's profile, permissions, wallet, and credit summary.

---

### Biometrics (`/api/biometrics`)

#### `GET /api/biometrics/demo-challenge/:passengerId`
Generate a cryptographic challenge for classroom simulation mode.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "mode": "DEMO — Simulated Fingerprint Authentication",
    "passengerId": "CB-PASS-1001",
    "passengerName": "Karthick Ramanathan",
    "challenge": "CB-PASS-1001.1773292400000.7f8a9b1c2d3e4f5a",
    "expiresAt": 1773292700000,
    "notice": "Academic simulation mode: No raw biological fingerprint scans are collected or stored."
  }
  ```

#### `POST /api/biometrics/demo-verify`
Verify passenger challenge match and retrieve wallet/credit balance for conductor ticketing.

#### `GET /api/biometrics/register-options`
Generate WebAuthn FIDO2 public-key credential options for device sensor enrolment.

#### `POST /api/biometrics/register-verify`
Verify WebAuthn credential attestation from client authenticator.

---

### Ticketing Operations (`/api/tickets`)

#### `GET /api/tickets/fare-preview`
Preview journey fare based on distance rules.
- **Query Parameters:** `routeId=R-101&boardingStopId=ST-101&destinationStopId=ST-105`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "valid": true,
    "fare": 50,
    "distanceKm": 16,
    "boardingStop": { "stopId": "ST-101", "stopName": "Majestic Central" },
    "destinationStop": { "stopId": "ST-105", "stopName": "Silk Board Junction" }
  }
  ```

#### `POST /api/tickets/generate`
Issue a verified ticket pass. Requires `CONDUCTOR` role with `GENERATE_TICKETS` permission.
- **Request Body:**
  ```json
  {
    "conductorEmployeeId": "CB-EMP-2001",
    "driverId": "DRV-101",
    "busNumber": "KA-01-F-4022",
    "routeId": "R-101",
    "passengerId": "CB-PASS-1001",
    "boardingStopId": "ST-101",
    "destinationStopId": "ST-103",
    "authVerified": true,
    "authMethod": "SIMULATED_FINGERPRINT",
    "authProof": "CB-PASS-1001.1773292400000.7f8a9b1c2d3e4f5a"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Bus ticket generated successfully",
    "ticket": {
      "ticketId": "TKT-3C9A1B2D",
      "passengerId": "CB-PASS-1001",
      "passengerName": "Karthick Ramanathan",
      "fare": 25,
      "paymentMethod": "WALLET",
      "status": "ISSUED",
      "signature": "8a3f9e0b1c2d...",
      "qrCodeDataUrl": "data:image/png;base64,..."
    }
  }
  ```

#### `POST /api/tickets/validate`
Verify ticket pass signature and mark status as `VALIDATED`.
- **Request Body:**
  ```json
  {
    "ticketId": "TKT-3C9A1B2D",
    "conductorEmployeeId": "CB-EMP-2001"
  }
  ```

---

### Wallets & Emergency Credit (`/api/wallet`)

#### `GET /api/wallet/details`
Retrieve wallet balance, credit limits, and recent transactions.

#### `POST /api/wallet/topup`
Add money with idempotency check.
- **Request Body:**
  ```json
  {
    "amount": 200,
    "paymentMethod": "Simulated Payment Gateway (Demo)",
    "idempotencyKey": "PAY-REF-998877"
  }
  ```

#### `POST /api/wallet/withdraw`
Request a fund refund or payout to bank/UPI.

#### `POST /api/wallet/credit/repay`
Repay outstanding emergency travel credit from funded wallet.
- **Request Body:**
  ```json
  {
    "amount": 35,
    "source": "WALLET"
  }
  ```

---

### System Administration (`/api/admin`)

- `GET /api/admin/analytics`: Real-time transport telemetry metrics.
- `GET /api/admin/passengers`: List passengers with wallet and credit balances.
- `PATCH /api/admin/passengers/:passengerId/status`: Activate or suspend accounts.
- `PATCH /api/admin/passengers/:passengerId/credit-limit`: Configure passenger credit limit.
- `GET /api/admin/conductors` / `POST /api/admin/conductors`: Manage conductor accounts.
- `POST /api/admin/buses`: Register vehicle fleet numbers and capacities.
- `POST /api/admin/drivers`: Register licensed bus operators.
- `GET /api/admin/fare-rules` / `PUT /api/admin/fare-rules`: Update pricing table.
- `GET /api/admin/audit-logs`: Inspect immutable audit records.
