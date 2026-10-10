# CloudBus — DynamoDB Database Design & Access Patterns

## 1. Database Architecture Overview

CloudBus uses Amazon DynamoDB as its primary high-speed NoSQL database. Rather than blindly translating relational tables, the database keys and Global Secondary Indexes (GSIs) are tailored to actual application access patterns, ensuring O(1) primary key lookups and atomic multi-item transactions.

In local development mode without AWS credentials, CloudBus uses a file-backed JSON repository (`LocalRepository`) implementing the exact same `IRepository` contract and transactional behavior.

---

## 2. Table Schemas and Primary Keys

### 1. `CloudBus_Users`
- **Partition Key (PK):** `id` (String, e.g. `usr-pass-1`)
- **Global Secondary Index (GSI):** `EmailIndex` (PK: `email`, Projection: ALL)
- **Attributes:** `email`, `passwordHash`, `role` (`ADMIN` | `CONDUCTOR` | `PASSENGER`), `status` (`ACTIVE` | `SUSPENDED`), `createdAt`, `updatedAt`

### 2. `CloudBus_PassengerProfiles`
- **PK:** `userId` (String)
- **GSI:** `PassengerIdIndex` (PK: `passengerId`, Projection: ALL)
- **Attributes:** `passengerId` (e.g. `CB-PASS-1001`), `fullName`, `email`, `mobileNumber`, `dateOfBirth`, `emergencyContact`, `biometricEnrolled` (Boolean), `biometricCredentialId`, `termsConsent` (Boolean), `createdAt`, `updatedAt`

### 3. `CloudBus_ConductorProfiles`
- **PK:** `userId` (String)
- **GSI:** `EmployeeIdIndex` (PK: `employeeId`, Projection: ALL)
- **Attributes:** `employeeId` (e.g. `CB-EMP-2001`), `fullName`, `mobileNumber`, `assignedBusId`, `assignedRouteId`, `status`, `createdAt`

### 4. `CloudBus_Drivers`
- **PK:** `driverId` (String, e.g. `DRV-101`)
- **Attributes:** `fullName`, `licenseNumber`, `phone`, `status`, `createdAt`

### 5. `CloudBus_Buses`
- **PK:** `busId` (String, e.g. `BUS-01`)
- **GSI:** `BusNumberIndex` (PK: `busNumber`, Projection: ALL)
- **Attributes:** `busNumber`, `capacity`, `registrationNumber`, `status`, `defaultRouteId`, `createdAt`

### 6. `CloudBus_Routes`
- **PK:** `routeId` (String, e.g. `R-101`)
- **Attributes:** `routeNumber`, `routeName`, `startStopId`, `endStopId`, `totalDistanceKm`, `status`, `stops` (List of RouteStop items), `createdAt`

### 7. `CloudBus_Stops`
- **PK:** `stopId` (String, e.g. `ST-101`)
- **Attributes:** `stopName`, `code`, `latitude`, `longitude`

### 8. `CloudBus_FareRules`
- **PK:** `ruleId` (String, constant: `DEFAULT_RULES`)
- **Attributes:** `baseFare` (Number), `perKmRate` (Number), `minimumFare` (Number), `maximumFare` (Number), `currency` (`INR`), `updatedAt`

### 9. `CloudBus_BiometricCredentials`
- **PK:** `userId` (String)
- **GSI:** `CredentialIdIndex` (PK: `credentialId`, Projection: ALL)
- **Attributes:** `credentialId`, `publicKey` (Base64 string), `counter` (Number), `transports` (List), `deviceType`, `createdAt`
- *Note:* Absolutely NO biological fingerprint images or templates are stored. Only FIDO2 public-key cryptography metadata.

### 10. `CloudBus_Wallets`
- **PK:** `walletId` (String, e.g. `wlt-CB-PASS-1001`)
- **GSI:** `PassengerIdIndex` (PK: `passengerId`, Projection: ALL)
- **Attributes:** `userId`, `passengerId`, `balance` (Number, enforced >= 0), `currency` (`INR`), `lastUpdated`

### 11. `CloudBus_WalletTransactions`
- **PK:** `transactionId` (String, e.g. `tx-topup-1`)
- **GSI 1:** `UserIdIndex` (PK: `userId`, Projection: ALL)
- **GSI 2:** `IdempotencyIndex` (PK: `idempotencyKey`, Projection: ALL)
- **Attributes:** `walletId`, `userId`, `amount`, `type` (`ADD_MONEY` | `FARE_DEDUCTION` | `CREDIT_REPAYMENT` | `WITHDRAWAL`), `referenceId`, `balanceBefore`, `balanceAfter`, `status`, `description`, `idempotencyKey`, `createdAt`

### 12. `CloudBus_CreditAccounts`
- **PK:** `creditAccountId` (String, e.g. `crd-CB-PASS-1001`)
- **GSI:** `PassengerIdIndex` (PK: `passengerId`, Projection: ALL)
- **Attributes:** `userId`, `passengerId`, `maxCreditLimit` (Number, default 200), `outstandingCredit` (Number), `availableCredit` (Number), `status` (`ACTIVE` | `OVERDUE` | `BLOCKED`), `lastRepaymentDate`, `createdAt`, `updatedAt`

### 13. `CloudBus_Tickets`
- **PK:** `ticketId` (String, e.g. `TKT-A1B2C3D4`)
- **GSI 1:** `PassengerIdIndex` (PK: `passengerId`, Projection: ALL)
- **GSI 2:** `ConductorIdIndex` (PK: `conductorEmployeeId`, Projection: ALL)
- **Attributes:** `qrCodeData`, `passengerId`, `passengerName`, `conductorEmployeeId`, `conductorName`, `driverId`, `driverName`, `busNumber`, `routeId`, `routeName`, `boardingStopId`, `boardingStopName`, `destinationStopId`, `destinationStopName`, `fare`, `paymentMethod` (`WALLET` | `TRAVEL_CREDIT`), `status` (`ISSUED` | `VALIDATED` | `CANCELLED` | `EXPIRED`), `issuedAt`, `validatedAt`, `validatedBy`, `signature` (HMAC-SHA256 hex digest)

### 14. `CloudBus_WithdrawalRequests`
- **PK:** `withdrawalId` (String, e.g. `WTH-1001`)
- **Attributes:** `userId`, `passengerId`, `amount`, `status` (`PENDING` | `APPROVED` | `REJECTED`), `bankDetails`, `requestedAt`, `reviewedAt`, `reviewedBy`, `reason`

### 15. `CloudBus_AuditLogs`
- **PK:** `logId` (String, e.g. `LOG-1001`)
- **Attributes:** `timestamp`, `actorUserId`, `actorRole`, `action`, `targetResource`, `details` (Map), `ipAddress`, `status` (`SUCCESS` | `FAILURE`)

---

## 3. Atomic Multi-Item Transactions (`TransactWriteItems`)

When a conductor issues a ticket, the operation performs an atomic transactional update:

```json
{
  "TransactItems": [
    {
      "Put": {
        "TableName": "CloudBus_Tickets",
        "Item": { ...ticketItem }
      }
    },
    {
      "Update": {
        "TableName": "CloudBus_Wallets",
        "Key": { "walletId": "wlt-1001" },
        "UpdateExpression": "SET balance = :bal, lastUpdated = :lu",
        "ConditionExpression": "balance >= :zero",
        "ExpressionAttributeValues": { ":bal": 75, ":zero": 0 }
      }
    },
    {
      "Put": {
        "TableName": "CloudBus_WalletTransactions",
        "Item": { ...fareTransactionItem }
      }
    }
  ]
}
```

If the passenger's balance changes concurrently or falls below zero, DynamoDB aborts the transaction with `TransactionCanceledException`, preventing duplicate deductions, ghost tickets, or negative balances.
