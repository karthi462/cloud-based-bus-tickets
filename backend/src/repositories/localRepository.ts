import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
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

interface DatabaseData {
  users: User[];
  passengerProfiles: PassengerProfile[];
  conductorProfiles: ConductorProfile[];
  drivers: Driver[];
  buses: Bus[];
  routes: Route[];
  stops: Stop[];
  fareRules: FareRules;
  biometricCredentials: BiometricCredential[];
  wallets: Wallet[];
  walletTransactions: WalletTransaction[];
  creditAccounts: CreditAccount[];
  tickets: Ticket[];
  withdrawalRequests: WithdrawalRequest[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

export class LocalRepository implements IRepository {
  private dataDir: string;
  private dbFilePath: string;
  private data: DatabaseData;

  constructor(customPath?: string) {
    this.dataDir = customPath ? path.dirname(customPath) : path.join(process.cwd(), 'data');
    this.dbFilePath = customPath || path.join(this.dataDir, 'db.json');
    this.data = this.loadData();
  }

  private loadData(): DatabaseData {
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (err) {
        // Ignore in test memory environments
      }
    }

    if (fs.existsSync(this.dbFilePath)) {
      try {
        const fileContent = fs.readFileSync(this.dbFilePath, 'utf-8');
        return JSON.parse(fileContent);
      } catch (err) {
        console.warn('Error reading db.json, generating default seed data', err);
      }
    }

    const defaultSeed = this.generateSeedData();
    this.saveData(defaultSeed);
    return defaultSeed;
  }

  public saveData(dataToSave?: DatabaseData): void {
    const data = dataToSave || this.data;
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      // In-memory fallback
    }
  }

  private generateSeedData(): DatabaseData {
    const defaultPasswordHash = bcrypt.hashSync('admin123', 10);
    const conductorPasswordHash = bcrypt.hashSync('conductor123', 10);
    const passengerPasswordHash = bcrypt.hashSync('pass123', 10);

    const now = new Date().toISOString();

    const users: User[] = [
      {
        id: 'usr-admin-1',
        email: 'admin@cloudbus.gov',
        passwordHash: defaultPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr-cond-1',
        email: 'conductor1@cloudbus.gov',
        passwordHash: conductorPasswordHash,
        role: 'CONDUCTOR',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr-cond-2',
        email: 'conductor2@cloudbus.gov',
        passwordHash: conductorPasswordHash,
        role: 'CONDUCTOR',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr-pass-1',
        email: 'passenger@cloudbus.com',
        passwordHash: passengerPasswordHash,
        role: 'PASSENGER',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr-pass-2',
        email: 'emergency@cloudbus.com',
        passwordHash: passengerPasswordHash,
        role: 'PASSENGER',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr-pass-3',
        email: 'nearlimit@cloudbus.com',
        passwordHash: passengerPasswordHash,
        role: 'PASSENGER',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const passengerProfiles: PassengerProfile[] = [
      {
        userId: 'usr-pass-1',
        passengerId: 'CB-PASS-1001',
        fullName: 'Karthick Ramanathan',
        email: 'passenger@cloudbus.com',
        mobileNumber: '9876543210',
        biometricEnrolled: true,
        biometricType: 'SIMULATED',
        termsConsent: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: 'usr-pass-2',
        passengerId: 'CB-PASS-1002',
        fullName: 'Vikram Singh',
        email: 'emergency@cloudbus.com',
        mobileNumber: '9876543211',
        biometricEnrolled: true,
        biometricType: 'SIMULATED',
        termsConsent: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: 'usr-pass-3',
        passengerId: 'CB-PASS-1003',
        fullName: 'Sneha Patel',
        email: 'nearlimit@cloudbus.com',
        mobileNumber: '9876543212',
        biometricEnrolled: true,
        biometricType: 'SIMULATED',
        termsConsent: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const conductorProfiles: ConductorProfile[] = [
      {
        userId: 'usr-cond-1',
        employeeId: 'CB-EMP-2001',
        fullName: 'Rajesh Kumar',
        mobileNumber: '9845011111',
        assignedBusId: 'BUS-01',
        assignedRouteId: 'R-101',
        status: 'ACTIVE',
        createdAt: now,
      },
      {
        userId: 'usr-cond-2',
        employeeId: 'CB-EMP-2002',
        fullName: 'Priya Sharma',
        mobileNumber: '9845022222',
        assignedBusId: 'BUS-02',
        assignedRouteId: 'R-202',
        status: 'ACTIVE',
        createdAt: now,
      },
    ];

    const drivers: Driver[] = [
      {
        driverId: 'DRV-101',
        fullName: 'Suresh Gowda',
        licenseNumber: 'DL-KA01-20150001',
        phone: '9845100001',
        status: 'ACTIVE',
        createdAt: now,
      },
      {
        driverId: 'DRV-102',
        fullName: 'Anand Verma',
        licenseNumber: 'DL-KA01-20160002',
        phone: '9845100002',
        status: 'ACTIVE',
        createdAt: now,
      },
    ];

    const buses: Bus[] = [
      {
        busId: 'BUS-01',
        busNumber: 'KA-01-F-4022',
        capacity: 45,
        registrationNumber: 'KA-01-F-4022',
        status: 'ACTIVE',
        defaultRouteId: 'R-101',
        createdAt: now,
      },
      {
        busId: 'BUS-02',
        busNumber: 'KA-01-F-5011',
        capacity: 50,
        registrationNumber: 'KA-01-F-5011',
        status: 'ACTIVE',
        defaultRouteId: 'R-202',
        createdAt: now,
      },
    ];

    const stops: Stop[] = [
      { stopId: 'ST-101', stopName: 'Majestic Central', code: 'MAJ' },
      { stopId: 'ST-102', stopName: 'Corporation Circle', code: 'CORP' },
      { stopId: 'ST-103', stopName: 'Lalbagh Botanical Gardens', code: 'LALB' },
      { stopId: 'ST-104', stopName: 'Dairy Circle', code: 'DAIR' },
      { stopId: 'ST-105', stopName: 'Silk Board Junction', code: 'SILK' },
      { stopId: 'ST-106', stopName: 'Bommanahalli', code: 'BOMM' },
      { stopId: 'ST-107', stopName: 'Electronic City Phase 1', code: 'ELCT' },
      { stopId: 'ST-201', stopName: 'Kempegowda Bus Station', code: 'KBS' },
      { stopId: 'ST-202', stopName: 'MG Road Metro', code: 'MGRD' },
      { stopId: 'ST-203', stopName: 'Indiranagar 100ft Rd', code: 'INDR' },
      { stopId: 'ST-204', stopName: 'Marathahalli Bridge', code: 'MRTH' },
      { stopId: 'ST-205', stopName: 'ITPL Whitefield', code: 'ITPL' },
    ];

    const routes: Route[] = [
      {
        routeId: 'R-101',
        routeNumber: 'R-101',
        routeName: 'Majestic to Electronic City',
        startStopId: 'ST-101',
        endStopId: 'ST-107',
        totalDistanceKm: 24,
        status: 'ACTIVE',
        createdAt: now,
        stops: [
          { routeId: 'R-101', stopId: 'ST-101', stopName: 'Majestic Central', sequenceIndex: 1, distanceFromStartKm: 0, fareFromStart: 10 },
          { routeId: 'R-101', stopId: 'ST-102', stopName: 'Corporation Circle', sequenceIndex: 2, distanceFromStartKm: 3, fareFromStart: 15 },
          { routeId: 'R-101', stopId: 'ST-103', stopName: 'Lalbagh Botanical Gardens', sequenceIndex: 3, distanceFromStartKm: 6, fareFromStart: 20 },
          { routeId: 'R-101', stopId: 'ST-104', stopName: 'Dairy Circle', sequenceIndex: 4, distanceFromStartKm: 10, fareFromStart: 25 },
          { routeId: 'R-101', stopId: 'ST-105', stopName: 'Silk Board Junction', sequenceIndex: 5, distanceFromStartKm: 16, fareFromStart: 30 },
          { routeId: 'R-101', stopId: 'ST-106', stopName: 'Bommanahalli', sequenceIndex: 6, distanceFromStartKm: 19, fareFromStart: 35 },
          { routeId: 'R-101', stopId: 'ST-107', stopName: 'Electronic City Phase 1', sequenceIndex: 7, distanceFromStartKm: 24, fareFromStart: 40 },
        ],
      },
      {
        routeId: 'R-202',
        routeNumber: 'R-202',
        routeName: 'Kempegowda Bus Station to ITPL Whitefield',
        startStopId: 'ST-201',
        endStopId: 'ST-205',
        totalDistanceKm: 20,
        status: 'ACTIVE',
        createdAt: now,
        stops: [
          { routeId: 'R-202', stopId: 'ST-201', stopName: 'Kempegowda Bus Station', sequenceIndex: 1, distanceFromStartKm: 0, fareFromStart: 10 },
          { routeId: 'R-202', stopId: 'ST-202', stopName: 'MG Road Metro', sequenceIndex: 2, distanceFromStartKm: 5, fareFromStart: 20 },
          { routeId: 'R-202', stopId: 'ST-203', stopName: 'Indiranagar 100ft Rd', sequenceIndex: 3, distanceFromStartKm: 9, fareFromStart: 25 },
          { routeId: 'R-202', stopId: 'ST-204', stopName: 'Marathahalli Bridge', sequenceIndex: 4, distanceFromStartKm: 14, fareFromStart: 30 },
          { routeId: 'R-202', stopId: 'ST-205', stopName: 'ITPL Whitefield', sequenceIndex: 5, distanceFromStartKm: 20, fareFromStart: 40 },
        ],
      },
    ];

    const fareRules: FareRules = { ...CONFIG.DEFAULT_FARE_RULES };

    // Wallets:
    // Passenger 1: balance ₹100
    // Passenger 2: balance ₹0
    // Passenger 3: balance ₹0
    const wallets: Wallet[] = [
      {
        walletId: 'wlt-1001',
        userId: 'usr-pass-1',
        passengerId: 'CB-PASS-1001',
        balance: 100,
        currency: 'INR',
        lastUpdated: now,
      },
      {
        walletId: 'wlt-1002',
        userId: 'usr-pass-2',
        passengerId: 'CB-PASS-1002',
        balance: 0,
        currency: 'INR',
        lastUpdated: now,
      },
      {
        walletId: 'wlt-1003',
        userId: 'usr-pass-3',
        passengerId: 'CB-PASS-1003',
        balance: 0,
        currency: 'INR',
        lastUpdated: now,
      },
    ];

    const walletTransactions: WalletTransaction[] = [
      {
        transactionId: 'tx-init-1',
        walletId: 'wlt-1001',
        userId: 'usr-pass-1',
        amount: 100,
        type: 'ADD_MONEY',
        referenceId: 'TOPUP-INIT-1001',
        balanceBefore: 0,
        balanceAfter: 100,
        status: 'SUCCESS',
        description: 'Initial Wallet Top-up (Demo)',
        createdAt: now,
      },
    ];

    // Credit Accounts:
    // Passenger 1: outstanding ₹0, available ₹200
    // Passenger 2: outstanding ₹0, available ₹200 (eligible for ₹30 credit)
    // Passenger 3: outstanding ₹190, available ₹10 (limit ₹200 - will reject ₹30 fare!)
    const creditAccounts: CreditAccount[] = [
      {
        creditAccountId: 'crd-1001',
        userId: 'usr-pass-1',
        passengerId: 'CB-PASS-1001',
        maxCreditLimit: 200,
        outstandingCredit: 0,
        availableCredit: 200,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        creditAccountId: 'crd-1002',
        userId: 'usr-pass-2',
        passengerId: 'CB-PASS-1002',
        maxCreditLimit: 200,
        outstandingCredit: 0,
        availableCredit: 200,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        creditAccountId: 'crd-1003',
        userId: 'usr-pass-3',
        passengerId: 'CB-PASS-1003',
        maxCreditLimit: 200,
        outstandingCredit: 190,
        availableCredit: 10,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
    ];

    return {
      users,
      passengerProfiles,
      conductorProfiles,
      drivers,
      buses,
      routes,
      stops,
      fareRules,
      biometricCredentials: [],
      wallets,
      walletTransactions,
      creditAccounts,
      tickets: [],
      withdrawalRequests: [],
      notifications: [],
      auditLogs: [
        {
          logId: 'log-seed-1',
          timestamp: now,
          action: 'SYSTEM_BOOTSTRAP',
          targetResource: 'DATABASE',
          details: { message: 'CloudBus initialized with academic seed dataset' },
          status: 'SUCCESS',
        },
      ],
    };
  }

  // Users
  async getUserById(id: string): Promise<User | null> {
    return this.data.users.find((u) => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async createUser(user: User): Promise<User> {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveData();
    return this.data.users[idx];
  }

  async listUsers(): Promise<User[]> {
    return [...this.data.users];
  }

  // Passenger Profiles
  async getPassengerProfileByUserId(userId: string): Promise<PassengerProfile | null> {
    return this.data.passengerProfiles.find((p) => p.userId === userId) || null;
  }

  async getPassengerProfileByPassengerId(passengerId: string): Promise<PassengerProfile | null> {
    return this.data.passengerProfiles.find((p) => p.passengerId === passengerId) || null;
  }

  async createPassengerProfile(profile: PassengerProfile): Promise<PassengerProfile> {
    this.data.passengerProfiles.push(profile);
    this.saveData();
    return profile;
  }

  async updatePassengerProfile(userId: string, updates: Partial<PassengerProfile>): Promise<PassengerProfile | null> {
    const idx = this.data.passengerProfiles.findIndex((p) => p.userId === userId);
    if (idx === -1) return null;
    this.data.passengerProfiles[idx] = { ...this.data.passengerProfiles[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveData();
    return this.data.passengerProfiles[idx];
  }

  async listPassengerProfiles(): Promise<PassengerProfile[]> {
    return [...this.data.passengerProfiles];
  }

  // Conductor Profiles
  async getConductorProfileByUserId(userId: string): Promise<ConductorProfile | null> {
    return this.data.conductorProfiles.find((c) => c.userId === userId) || null;
  }

  async getConductorProfileByEmployeeId(employeeId: string): Promise<ConductorProfile | null> {
    return this.data.conductorProfiles.find((c) => c.employeeId === employeeId) || null;
  }

  async createConductorProfile(profile: ConductorProfile): Promise<ConductorProfile> {
    this.data.conductorProfiles.push(profile);
    this.saveData();
    return profile;
  }

  async updateConductorProfile(userId: string, updates: Partial<ConductorProfile>): Promise<ConductorProfile | null> {
    const idx = this.data.conductorProfiles.findIndex((c) => c.userId === userId);
    if (idx === -1) return null;
    this.data.conductorProfiles[idx] = { ...this.data.conductorProfiles[idx], ...updates };
    this.saveData();
    return this.data.conductorProfiles[idx];
  }

  async listConductorProfiles(): Promise<ConductorProfile[]> {
    return [...this.data.conductorProfiles];
  }

  // Drivers
  async getDriverById(driverId: string): Promise<Driver | null> {
    return this.data.drivers.find((d) => d.driverId === driverId) || null;
  }

  async createDriver(driver: Driver): Promise<Driver> {
    this.data.drivers.push(driver);
    this.saveData();
    return driver;
  }

  async updateDriver(driverId: string, updates: Partial<Driver>): Promise<Driver | null> {
    const idx = this.data.drivers.findIndex((d) => d.driverId === driverId);
    if (idx === -1) return null;
    this.data.drivers[idx] = { ...this.data.drivers[idx], ...updates };
    this.saveData();
    return this.data.drivers[idx];
  }

  async listDrivers(): Promise<Driver[]> {
    return [...this.data.drivers];
  }

  // Buses
  async getBusById(busId: string): Promise<Bus | null> {
    return this.data.buses.find((b) => b.busId === busId) || null;
  }

  async getBusByNumber(busNumber: string): Promise<Bus | null> {
    return this.data.buses.find((b) => b.busNumber.toUpperCase() === busNumber.toUpperCase()) || null;
  }

  async createBus(bus: Bus): Promise<Bus> {
    this.data.buses.push(bus);
    this.saveData();
    return bus;
  }

  async updateBus(busId: string, updates: Partial<Bus>): Promise<Bus | null> {
    const idx = this.data.buses.findIndex((b) => b.busId === busId);
    if (idx === -1) return null;
    this.data.buses[idx] = { ...this.data.buses[idx], ...updates };
    this.saveData();
    return this.data.buses[idx];
  }

  async listBuses(): Promise<Bus[]> {
    return [...this.data.buses];
  }

  // Routes & Stops
  async getRouteById(routeId: string): Promise<Route | null> {
    return this.data.routes.find((r) => r.routeId === routeId) || null;
  }

  async createRoute(route: Route): Promise<Route> {
    this.data.routes.push(route);
    this.saveData();
    return route;
  }

  async updateRoute(routeId: string, updates: Partial<Route>): Promise<Route | null> {
    const idx = this.data.routes.findIndex((r) => r.routeId === routeId);
    if (idx === -1) return null;
    this.data.routes[idx] = { ...this.data.routes[idx], ...updates };
    this.saveData();
    return this.data.routes[idx];
  }

  async listRoutes(): Promise<Route[]> {
    return [...this.data.routes];
  }

  async listStops(): Promise<Stop[]> {
    return [...this.data.stops];
  }

  async createStop(stop: Stop): Promise<Stop> {
    this.data.stops.push(stop);
    this.saveData();
    return stop;
  }

  // Fare Rules
  async getFareRules(): Promise<FareRules> {
    return { ...this.data.fareRules };
  }

  async updateFareRules(rules: Partial<FareRules>): Promise<FareRules> {
    this.data.fareRules = {
      ...this.data.fareRules,
      ...rules,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return { ...this.data.fareRules };
  }

  // Biometrics
  async getBiometricCredentialByUserId(userId: string): Promise<BiometricCredential | null> {
    return this.data.biometricCredentials.find((b) => b.userId === userId) || null;
  }

  async getBiometricCredentialByCredentialId(credentialId: string): Promise<BiometricCredential | null> {
    return this.data.biometricCredentials.find((b) => b.credentialId === credentialId) || null;
  }

  async saveBiometricCredential(cred: BiometricCredential): Promise<BiometricCredential> {
    const idx = this.data.biometricCredentials.findIndex((b) => b.userId === cred.userId);
    if (idx !== -1) {
      this.data.biometricCredentials[idx] = cred;
    } else {
      this.data.biometricCredentials.push(cred);
    }
    this.saveData();
    return cred;
  }

  async deleteBiometricCredential(userId: string): Promise<void> {
    this.data.biometricCredentials = this.data.biometricCredentials.filter((b) => b.userId !== userId);
    this.saveData();
  }

  // Wallets & Transactions
  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    return this.data.wallets.find((w) => w.userId === userId) || null;
  }

  async getWalletByPassengerId(passengerId: string): Promise<Wallet | null> {
    return this.data.wallets.find((w) => w.passengerId === passengerId) || null;
  }

  async createWallet(wallet: Wallet): Promise<Wallet> {
    this.data.wallets.push(wallet);
    this.saveData();
    return wallet;
  }

  async updateWalletBalance(walletId: string, newBalance: number): Promise<Wallet | null> {
    const idx = this.data.wallets.findIndex((w) => w.walletId === walletId);
    if (idx === -1) return null;
    this.data.wallets[idx].balance = newBalance;
    this.data.wallets[idx].lastUpdated = new Date().toISOString();
    this.saveData();
    return this.data.wallets[idx];
  }

  async createWalletTransaction(tx: WalletTransaction): Promise<WalletTransaction> {
    this.data.walletTransactions.push(tx);
    this.saveData();
    return tx;
  }

  async listTransactionsByUserId(userId: string): Promise<WalletTransaction[]> {
    return this.data.walletTransactions.filter((tx) => tx.userId === userId).reverse();
  }

  async listAllTransactions(): Promise<WalletTransaction[]> {
    return [...this.data.walletTransactions].reverse();
  }

  async getTransactionByIdempotencyKey(key: string): Promise<WalletTransaction | null> {
    if (!key) return null;
    return this.data.walletTransactions.find((tx) => tx.idempotencyKey === key) || null;
  }

  // Credit Accounts
  async getCreditAccountByUserId(userId: string): Promise<CreditAccount | null> {
    return this.data.creditAccounts.find((c) => c.userId === userId) || null;
  }

  async getCreditAccountByPassengerId(passengerId: string): Promise<CreditAccount | null> {
    return this.data.creditAccounts.find((c) => c.passengerId === passengerId) || null;
  }

  async createCreditAccount(account: CreditAccount): Promise<CreditAccount> {
    this.data.creditAccounts.push(account);
    this.saveData();
    return account;
  }

  async updateCreditAccount(creditAccountId: string, updates: Partial<CreditAccount>): Promise<CreditAccount | null> {
    const idx = this.data.creditAccounts.findIndex((c) => c.creditAccountId === creditAccountId);
    if (idx === -1) return null;
    this.data.creditAccounts[idx] = {
      ...this.data.creditAccounts[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.creditAccounts[idx];
  }

  async listAllCreditAccounts(): Promise<CreditAccount[]> {
    return [...this.data.creditAccounts];
  }

  // Atomic Ticketing Operation
  async createTicketWithPayment(
    ticket: Ticket,
    walletUpdate?: { walletId: string; newBalance: number; transaction: WalletTransaction },
    creditUpdate?: { creditAccountId: string; newOutstandingCredit: number; newAvailableCredit: number }
  ): Promise<Ticket> {
    // Perform updates in atomic-like consistency block
    if (walletUpdate) {
      const wIdx = this.data.wallets.findIndex((w) => w.walletId === walletUpdate.walletId);
      if (wIdx === -1) throw new Error('Wallet not found');
      if (walletUpdate.newBalance < 0) throw new Error('Wallet balance cannot be negative');
      this.data.wallets[wIdx].balance = walletUpdate.newBalance;
      this.data.wallets[wIdx].lastUpdated = new Date().toISOString();
      this.data.walletTransactions.push(walletUpdate.transaction);
    }

    if (creditUpdate) {
      const cIdx = this.data.creditAccounts.findIndex((c) => c.creditAccountId === creditUpdate.creditAccountId);
      if (cIdx === -1) throw new Error('Credit account not found');
      if (creditUpdate.newOutstandingCredit > this.data.creditAccounts[cIdx].maxCreditLimit) {
        throw new Error('Credit limit exceeded');
      }
      this.data.creditAccounts[cIdx].outstandingCredit = creditUpdate.newOutstandingCredit;
      this.data.creditAccounts[cIdx].availableCredit = creditUpdate.newAvailableCredit;
      this.data.creditAccounts[cIdx].updatedAt = new Date().toISOString();
    }

    this.data.tickets.push(ticket);
    this.saveData();
    return ticket;
  }

  // Tickets
  async getTicketById(ticketId: string): Promise<Ticket | null> {
    return this.data.tickets.find((t) => t.ticketId === ticketId) || null;
  }

  async listTicketsByPassengerId(passengerId: string): Promise<Ticket[]> {
    return this.data.tickets.filter((t) => t.passengerId === passengerId).reverse();
  }

  async listTicketsByConductorId(conductorEmployeeId: string): Promise<Ticket[]> {
    return this.data.tickets.filter((t) => t.conductorEmployeeId === conductorEmployeeId).reverse();
  }

  async listAllTickets(): Promise<Ticket[]> {
    return [...this.data.tickets].reverse();
  }

  async updateTicketStatus(ticketId: string, status: Ticket['status'], validatedBy?: string): Promise<Ticket | null> {
    const idx = this.data.tickets.findIndex((t) => t.ticketId === ticketId);
    if (idx === -1) return null;
    this.data.tickets[idx].status = status;
    if (status === 'VALIDATED') {
      this.data.tickets[idx].validatedAt = new Date().toISOString();
      if (validatedBy) this.data.tickets[idx].validatedBy = validatedBy;
    }
    this.saveData();
    return this.data.tickets[idx];
  }

  // Withdrawals
  async createWithdrawalRequest(req: WithdrawalRequest): Promise<WithdrawalRequest> {
    this.data.withdrawalRequests.push(req);
    this.saveData();
    return req;
  }

  async getWithdrawalRequestById(withdrawalId: string): Promise<WithdrawalRequest | null> {
    return this.data.withdrawalRequests.find((w) => w.withdrawalId === withdrawalId) || null;
  }

  async updateWithdrawalRequest(withdrawalId: string, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | null> {
    const idx = this.data.withdrawalRequests.findIndex((w) => w.withdrawalId === withdrawalId);
    if (idx === -1) return null;
    this.data.withdrawalRequests[idx] = {
      ...this.data.withdrawalRequests[idx],
      ...updates,
      reviewedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.withdrawalRequests[idx];
  }

  async listWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    return [...this.data.withdrawalRequests].reverse();
  }

  // Notifications
  async createNotification(notif: Notification): Promise<Notification> {
    this.data.notifications.push(notif);
    this.saveData();
    return notif;
  }

  async listNotificationsByUserId(userId: string): Promise<Notification[]> {
    return this.data.notifications.filter((n) => n.userId === userId).reverse();
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const n = this.data.notifications.find((notif) => notif.notificationId === notificationId);
    if (n) {
      n.isRead = true;
      this.saveData();
    }
  }

  // Audit Logs
  async createAuditLog(log: AuditLog): Promise<AuditLog> {
    this.data.auditLogs.push(log);
    this.saveData();
    return log;
  }

  async listAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return [...this.data.auditLogs].reverse().slice(0, limit);
  }
}
