import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  ScanCommand,
  QueryCommand,
  TransactWriteCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { IRepository } from './repositoryInterface.js';
import {
  User,
  PassengerProfile,
  ConductorProfile,
  Driver,
  Bus,
  Route,
  Stop,
  FareRules,
  BiometricCredential,
  Wallet,
  WalletTransaction,
  CreditAccount,
  Ticket,
  WithdrawalRequest,
  Notification,
  AuditLog,
} from '../models/types.js';
import { CONFIG } from '../config/constants.js';

export class DynamoRepository implements IRepository {
  private docClient: DynamoDBDocumentClient;
  private prefix: string;

  constructor() {
    const ddbClient = new DynamoDBClient({ region: CONFIG.AWS_REGION });
    this.docClient = DynamoDBDocumentClient.from(ddbClient, {
      marshallOptions: { removeUndefinedValues: true },
    });
    this.prefix = CONFIG.DYNAMODB_TABLE_PREFIX;
  }

  private table(name: string): string {
    return `${this.prefix}${name}`;
  }

  // Users
  async getUserById(id: string): Promise<User | null> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('Users'), Key: { id } })
    );
    return (res.Item as User) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('Users'),
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email.toLowerCase() },
      })
    );
    return res.Items && res.Items.length > 0 ? (res.Items[0] as User) : null;
  }

  async createUser(user: User): Promise<User> {
    await this.docClient.send(
      new PutCommand({ TableName: this.table('Users'), Item: user })
    );
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const current = await this.getUserById(id);
    if (!current) return null;
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    await this.docClient.send(
      new PutCommand({ TableName: this.table('Users'), Item: updated })
    );
    return updated;
  }

  async listUsers(): Promise<User[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('Users') }));
    return (res.Items as User[]) || [];
  }

  // Passenger Profiles
  async getPassengerProfileByUserId(userId: string): Promise<PassengerProfile | null> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('PassengerProfiles'), Key: { userId } })
    );
    return (res.Item as PassengerProfile) || null;
  }

  async getPassengerProfileByPassengerId(passengerId: string): Promise<PassengerProfile | null> {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('PassengerProfiles'),
        IndexName: 'PassengerIdIndex',
        KeyConditionExpression: 'passengerId = :pid',
        ExpressionAttributeValues: { ':pid': passengerId },
      })
    );
    return res.Items && res.Items.length > 0 ? (res.Items[0] as PassengerProfile) : null;
  }

  async createPassengerProfile(profile: PassengerProfile): Promise<PassengerProfile> {
    await this.docClient.send(
      new PutCommand({ TableName: this.table('PassengerProfiles'), Item: profile })
    );
    return profile;
  }

  async updatePassengerProfile(userId: string, updates: Partial<PassengerProfile>): Promise<PassengerProfile | null> {
    const current = await this.getPassengerProfileByUserId(userId);
    if (!current) return null;
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    await this.docClient.send(
      new PutCommand({ TableName: this.table('PassengerProfiles'), Item: updated })
    );
    return updated;
  }

  async listPassengerProfiles(): Promise<PassengerProfile[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('PassengerProfiles') }));
    return (res.Items as PassengerProfile[]) || [];
  }

  // Conductor Profiles
  async getConductorProfileByUserId(userId: string): Promise<ConductorProfile | null> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('ConductorProfiles'), Key: { userId } })
    );
    return (res.Item as ConductorProfile) || null;
  }

  async getConductorProfileByEmployeeId(employeeId: string): Promise<ConductorProfile | null> {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('ConductorProfiles'),
        IndexName: 'EmployeeIdIndex',
        KeyConditionExpression: 'employeeId = :eid',
        ExpressionAttributeValues: { ':eid': employeeId },
      })
    );
    return res.Items && res.Items.length > 0 ? (res.Items[0] as ConductorProfile) : null;
  }

  async createConductorProfile(profile: ConductorProfile): Promise<ConductorProfile> {
    await this.docClient.send(
      new PutCommand({ TableName: this.table('ConductorProfiles'), Item: profile })
    );
    return profile;
  }

  async updateConductorProfile(userId: string, updates: Partial<ConductorProfile>): Promise<ConductorProfile | null> {
    const current = await this.getConductorProfileByUserId(userId);
    if (!current) return null;
    const updated = { ...current, ...updates };
    await this.docClient.send(
      new PutCommand({ TableName: this.table('ConductorProfiles'), Item: updated })
    );
    return updated;
  }

  async listConductorProfiles(): Promise<ConductorProfile[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('ConductorProfiles') }));
    return (res.Items as ConductorProfile[]) || [];
  }

  // Drivers
  async getDriverById(driverId: string): Promise<Driver | null> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('Drivers'), Key: { driverId } })
    );
    return (res.Item as Driver) || null;
  }

  async createDriver(driver: Driver): Promise<Driver> {
    await this.docClient.send(
      new PutCommand({ TableName: this.table('Drivers'), Item: driver })
    );
    return driver;
  }

  async updateDriver(driverId: string, updates: Partial<Driver>): Promise<Driver | null> {
    const current = await this.getDriverById(driverId);
    if (!current) return null;
    const updated = { ...current, ...updates };
    await this.docClient.send(
      new PutCommand({ TableName: this.table('Drivers'), Item: updated })
    );
    return updated;
  }

  async listDrivers(): Promise<Driver[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('Drivers') }));
    return (res.Items as Driver[]) || [];
  }

  // Buses
  async getBusById(busId: string): Promise<Bus | null> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('Buses'), Key: { busId } })
    );
    return (res.Item as Bus) || null;
  }

  async getBusByNumber(busNumber: string): Promise<Bus | null> {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('Buses'),
        IndexName: 'BusNumberIndex',
        KeyConditionExpression: 'busNumber = :bn',
        ExpressionAttributeValues: { ':bn': busNumber.toUpperCase() },
      })
    );
    return res.Items && res.Items.length > 0 ? (res.Items[0] as Bus) : null;
  }

  async createBus(bus: Bus): Promise<Bus> {
    await this.docClient.send(
      new PutCommand({ TableName: this.table('Buses'), Item: bus })
    );
    return bus;
  }

  async updateBus(busId: string, updates: Partial<Bus>): Promise<Bus | null> {
    const current = await this.getBusById(busId);
    if (!current) return null;
    const updated = { ...current, ...updates };
    await this.docClient.send(
      new PutCommand({ TableName: this.table('Buses'), Item: updated })
    );
    return updated;
  }

  async listBuses(): Promise<Bus[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('Buses') }));
    return (res.Items as Bus[]) || [];
  }

  // Routes & Stops
  async getRouteById(routeId: string): Promise<Route | null> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('Routes'), Key: { routeId } })
    );
    return (res.Item as Route) || null;
  }

  async createRoute(route: Route): Promise<Route> {
    await this.docClient.send(
      new PutCommand({ TableName: this.table('Routes'), Item: route })
    );
    return route;
  }

  async updateRoute(routeId: string, updates: Partial<Route>): Promise<Route | null> {
    const current = await this.getRouteById(routeId);
    if (!current) return null;
    const updated = { ...current, ...updates };
    await this.docClient.send(
      new PutCommand({ TableName: this.table('Routes'), Item: updated })
    );
    return updated;
  }

  async listRoutes(): Promise<Route[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('Routes') }));
    return (res.Items as Route[]) || [];
  }

  async listStops(): Promise<Stop[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('Stops') }));
    return (res.Items as Stop[]) || [];
  }

  async createStop(stop: Stop): Promise<Stop> {
    await this.docClient.send(
      new PutCommand({ TableName: this.table('Stops'), Item: stop })
    );
    return stop;
  }

  // Fare Rules
  async getFareRules(): Promise<FareRules> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('FareRules'), Key: { ruleId: 'DEFAULT_RULES' } })
    );
    return (res.Item as FareRules) || { ...CONFIG.DEFAULT_FARE_RULES };
  }

  async updateFareRules(rules: Partial<FareRules>): Promise<FareRules> {
    const current = await this.getFareRules();
    const updated = { ...current, ...rules, updatedAt: new Date().toISOString() };
    await this.docClient.send(
      new PutCommand({ TableName: this.table('FareRules'), Item: updated })
    );
    return updated;
  }

  // Biometrics
  async getBiometricCredentialByUserId(userId: string): Promise<BiometricCredential | null> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('BiometricCredentials'), Key: { userId } })
    );
    return (res.Item as BiometricCredential) || null;
  }

  async getBiometricCredentialByCredentialId(credentialId: string): Promise<BiometricCredential | null> {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('BiometricCredentials'),
        IndexName: 'CredentialIdIndex',
        KeyConditionExpression: 'credentialId = :cid',
        ExpressionAttributeValues: { ':cid': credentialId },
      })
    );
    return res.Items && res.Items.length > 0 ? (res.Items[0] as BiometricCredential) : null;
  }

  async saveBiometricCredential(cred: BiometricCredential): Promise<BiometricCredential> {
    await this.docClient.send(
      new PutCommand({ TableName: this.table('BiometricCredentials'), Item: cred })
    );
    return cred;
  }

  async deleteBiometricCredential(userId: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({ TableName: this.table('BiometricCredentials'), Key: { userId } })
    );
  }

  // Wallets & Transactions
  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('Wallets'), Key: { userId } })
    );
    return (res.Item as Wallet) || null;
  }

  async getWalletByPassengerId(passengerId: string): Promise<Wallet | null> {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('Wallets'),
        IndexName: 'PassengerIdIndex',
        KeyConditionExpression: 'passengerId = :pid',
        ExpressionAttributeValues: { ':pid': passengerId },
      })
    );
    return res.Items && res.Items.length > 0 ? (res.Items[0] as Wallet) : null;
  }

  async createWallet(wallet: Wallet): Promise<Wallet> {
    await this.docClient.send(
      new PutCommand({ TableName: this.table('Wallets'), Item: wallet })
    );
    return wallet;
  }

  async updateWalletBalance(walletId: string, newBalance: number): Promise<Wallet | null> {
    const res = await this.docClient.send(
      new UpdateCommand({
        TableName: this.table('Wallets'),
        Key: { walletId },
        UpdateExpression: 'SET balance = :b, lastUpdated = :lu',
        ConditionExpression: ':b >= :zero',
        ExpressionAttributeValues: {
          ':b': newBalance,
          ':lu': new Date().toISOString(),
          ':zero': 0,
        },
        ReturnValues: 'ALL_NEW',
      })
    );
    return (res.Attributes as Wallet) || null;
  }

  async createWalletTransaction(tx: WalletTransaction): Promise<WalletTransaction> {
    await this.docClient.send(
      new PutCommand({ TableName: this.table('WalletTransactions'), Item: tx })
    );
    return tx;
  }

  async listTransactionsByUserId(userId: string): Promise<WalletTransaction[]> {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('WalletTransactions'),
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
      })
    );
    return (res.Items as WalletTransaction[]) || [];
  }

  async listAllTransactions(): Promise<WalletTransaction[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('WalletTransactions') }));
    return (res.Items as WalletTransaction[]) || [];
  }

  async getTransactionByIdempotencyKey(key: string): Promise<WalletTransaction | null> {
    if (!key) return null;
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('WalletTransactions'),
        IndexName: 'IdempotencyIndex',
        KeyConditionExpression: 'idempotencyKey = :ik',
        ExpressionAttributeValues: { ':ik': key },
      })
    );
    return res.Items && res.Items.length > 0 ? (res.Items[0] as WalletTransaction) : null;
  }

  // Credit Accounts
  async getCreditAccountByUserId(userId: string): Promise<CreditAccount | null> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('CreditAccounts'), Key: { userId } })
    );
    return (res.Item as CreditAccount) || null;
  }

  async getCreditAccountByPassengerId(passengerId: string): Promise<CreditAccount | null> {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('CreditAccounts'),
        IndexName: 'PassengerIdIndex',
        KeyConditionExpression: 'passengerId = :pid',
        ExpressionAttributeValues: { ':pid': passengerId },
      })
    );
    return res.Items && res.Items.length > 0 ? (res.Items[0] as CreditAccount) : null;
  }

  async createCreditAccount(account: CreditAccount): Promise<CreditAccount> {
    await this.docClient.send(
      new PutCommand({ TableName: this.table('CreditAccounts'), Item: account })
    );
    return account;
  }

  async updateCreditAccount(creditAccountId: string, updates: Partial<CreditAccount>): Promise<CreditAccount | null> {
    const res = await this.docClient.send(
      new UpdateCommand({
        TableName: this.table('CreditAccounts'),
        Key: { creditAccountId },
        UpdateExpression: 'SET outstandingCredit = :oc, availableCredit = :ac, #st = :st, updatedAt = :ua',
        ExpressionAttributeNames: { '#st': 'status' },
        ExpressionAttributeValues: {
          ':oc': updates.outstandingCredit,
          ':ac': updates.availableCredit,
          ':st': updates.status || 'ACTIVE',
          ':ua': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      })
    );
    return (res.Attributes as CreditAccount) || null;
  }

  async listAllCreditAccounts(): Promise<CreditAccount[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('CreditAccounts') }));
    return (res.Items as CreditAccount[]) || [];
  }

  // Atomic Ticketing Operation using TransactWriteCommand
  async createTicketWithPayment(
    ticket: Ticket,
    walletUpdate?: { walletId: string; newBalance: number; transaction: WalletTransaction },
    creditUpdate?: { creditAccountId: string; newOutstandingCredit: number; newAvailableCredit: number }
  ): Promise<Ticket> {
    const transactItems: any[] = [
      {
        Put: {
          TableName: this.table('Tickets'),
          Item: ticket,
        },
      },
    ];

    if (walletUpdate) {
      transactItems.push({
        Update: {
          TableName: this.table('Wallets'),
          Key: { walletId: walletUpdate.walletId },
          UpdateExpression: 'SET balance = :bal, lastUpdated = :lu',
          ConditionExpression: 'balance >= :zero',
          ExpressionAttributeValues: {
            ':bal': walletUpdate.newBalance,
            ':lu': new Date().toISOString(),
            ':zero': 0,
          },
        },
      });
      transactItems.push({
        Put: {
          TableName: this.table('WalletTransactions'),
          Item: walletUpdate.transaction,
        },
      });
    }

    if (creditUpdate) {
      transactItems.push({
        Update: {
          TableName: this.table('CreditAccounts'),
          Key: { creditAccountId: creditUpdate.creditAccountId },
          UpdateExpression: 'SET outstandingCredit = :oc, availableCredit = :ac, updatedAt = :lu',
          ConditionExpression: ':oc <= maxCreditLimit',
          ExpressionAttributeValues: {
            ':oc': creditUpdate.newOutstandingCredit,
            ':ac': creditUpdate.newAvailableCredit,
            ':lu': new Date().toISOString(),
          },
        },
      });
    }

    await this.docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return ticket;
  }

  // Tickets
  async getTicketById(ticketId: string): Promise<Ticket | null> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('Tickets'), Key: { ticketId } })
    );
    return (res.Item as Ticket) || null;
  }

  async listTicketsByPassengerId(passengerId: string): Promise<Ticket[]> {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('Tickets'),
        IndexName: 'PassengerIdIndex',
        KeyConditionExpression: 'passengerId = :pid',
        ExpressionAttributeValues: { ':pid': passengerId },
      })
    );
    return (res.Items as Ticket[]) || [];
  }

  async listTicketsByConductorId(conductorEmployeeId: string): Promise<Ticket[]> {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('Tickets'),
        IndexName: 'ConductorIdIndex',
        KeyConditionExpression: 'conductorEmployeeId = :cid',
        ExpressionAttributeValues: { ':cid': conductorEmployeeId },
      })
    );
    return (res.Items as Ticket[]) || [];
  }

  async listAllTickets(): Promise<Ticket[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('Tickets') }));
    return (res.Items as Ticket[]) || [];
  }

  async updateTicketStatus(ticketId: string, status: Ticket['status'], validatedBy?: string): Promise<Ticket | null> {
    const current = await this.getTicketById(ticketId);
    if (!current) return null;
    const updated = {
      ...current,
      status,
      validatedAt: status === 'VALIDATED' ? new Date().toISOString() : current.validatedAt,
      validatedBy: validatedBy || current.validatedBy,
    };
    await this.docClient.send(new PutCommand({ TableName: this.table('Tickets'), Item: updated }));
    return updated;
  }

  // Withdrawals
  async createWithdrawalRequest(req: WithdrawalRequest): Promise<WithdrawalRequest> {
    await this.docClient.send(new PutCommand({ TableName: this.table('WithdrawalRequests'), Item: req }));
    return req;
  }

  async getWithdrawalRequestById(withdrawalId: string): Promise<WithdrawalRequest | null> {
    const res = await this.docClient.send(
      new GetCommand({ TableName: this.table('WithdrawalRequests'), Key: { withdrawalId } })
    );
    return (res.Item as WithdrawalRequest) || null;
  }

  async updateWithdrawalRequest(withdrawalId: string, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | null> {
    const current = await this.getWithdrawalRequestById(withdrawalId);
    if (!current) return null;
    const updated = { ...current, ...updates, reviewedAt: new Date().toISOString() };
    await this.docClient.send(new PutCommand({ TableName: this.table('WithdrawalRequests'), Item: updated }));
    return updated;
  }

  async listWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('WithdrawalRequests') }));
    return (res.Items as WithdrawalRequest[]) || [];
  }

  // Notifications
  async createNotification(notif: Notification): Promise<Notification> {
    await this.docClient.send(new PutCommand({ TableName: this.table('Notifications'), Item: notif }));
    return notif;
  }

  async listNotificationsByUserId(userId: string): Promise<Notification[]> {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.table('Notifications'),
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
      })
    );
    return (res.Items as Notification[]) || [];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.docClient.send(
      new UpdateCommand({
        TableName: this.table('Notifications'),
        Key: { notificationId },
        UpdateExpression: 'SET isRead = :r',
        ExpressionAttributeValues: { ':r': true },
      })
    );
  }

  // Audit Logs
  async createAuditLog(log: AuditLog): Promise<AuditLog> {
    await this.docClient.send(new PutCommand({ TableName: this.table('AuditLogs'), Item: log }));
    return log;
  }

  async listAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    const res = await this.docClient.send(new ScanCommand({ TableName: this.table('AuditLogs'), Limit: limit }));
    return (res.Items as AuditLog[]) || [];
  }
}
