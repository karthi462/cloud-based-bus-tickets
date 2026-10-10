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

export interface IRepository {
  // Users
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: User): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;
  listUsers(): Promise<User[]>;

  // Passenger Profiles
  getPassengerProfileByUserId(userId: string): Promise<PassengerProfile | null>;
  getPassengerProfileByPassengerId(passengerId: string): Promise<PassengerProfile | null>;
  createPassengerProfile(profile: PassengerProfile): Promise<PassengerProfile>;
  updatePassengerProfile(userId: string, updates: Partial<PassengerProfile>): Promise<PassengerProfile | null>;
  listPassengerProfiles(): Promise<PassengerProfile[]>;

  // Conductor Profiles
  getConductorProfileByUserId(userId: string): Promise<ConductorProfile | null>;
  getConductorProfileByEmployeeId(employeeId: string): Promise<ConductorProfile | null>;
  createConductorProfile(profile: ConductorProfile): Promise<ConductorProfile>;
  updateConductorProfile(userId: string, updates: Partial<ConductorProfile>): Promise<ConductorProfile | null>;
  listConductorProfiles(): Promise<ConductorProfile[]>;

  // Drivers
  getDriverById(driverId: string): Promise<Driver | null>;
  createDriver(driver: Driver): Promise<Driver>;
  updateDriver(driverId: string, updates: Partial<Driver>): Promise<Driver | null>;
  listDrivers(): Promise<Driver[]>;

  // Buses
  getBusById(busId: string): Promise<Bus | null>;
  getBusByNumber(busNumber: string): Promise<Bus | null>;
  createBus(bus: Bus): Promise<Bus>;
  updateBus(busId: string, updates: Partial<Bus>): Promise<Bus | null>;
  listBuses(): Promise<Bus[]>;

  // Routes & Stops
  getRouteById(routeId: string): Promise<Route | null>;
  createRoute(route: Route): Promise<Route>;
  updateRoute(routeId: string, updates: Partial<Route>): Promise<Route | null>;
  listRoutes(): Promise<Route[]>;
  listStops(): Promise<Stop[]>;
  createStop(stop: Stop): Promise<Stop>;

  // Fare Rules
  getFareRules(): Promise<FareRules>;
  updateFareRules(rules: Partial<FareRules>): Promise<FareRules>;

  // Biometrics
  getBiometricCredentialByUserId(userId: string): Promise<BiometricCredential | null>;
  getBiometricCredentialByCredentialId(credentialId: string): Promise<BiometricCredential | null>;
  saveBiometricCredential(cred: BiometricCredential): Promise<BiometricCredential>;
  deleteBiometricCredential(userId: string): Promise<void>;

  // Wallets & Transactions
  getWalletByUserId(userId: string): Promise<Wallet | null>;
  getWalletByPassengerId(passengerId: string): Promise<Wallet | null>;
  createWallet(wallet: Wallet): Promise<Wallet>;
  updateWalletBalance(walletId: string, newBalance: number): Promise<Wallet | null>;
  createWalletTransaction(tx: WalletTransaction): Promise<WalletTransaction>;
  listTransactionsByUserId(userId: string): Promise<WalletTransaction[]>;
  listAllTransactions(): Promise<WalletTransaction[]>;
  getTransactionByIdempotencyKey(key: string): Promise<WalletTransaction | null>;

  // Credit Accounts
  getCreditAccountByUserId(userId: string): Promise<CreditAccount | null>;
  getCreditAccountByPassengerId(passengerId: string): Promise<CreditAccount | null>;
  createCreditAccount(account: CreditAccount): Promise<CreditAccount>;
  updateCreditAccount(creditAccountId: string, updates: Partial<CreditAccount>): Promise<CreditAccount | null>;
  listAllCreditAccounts(): Promise<CreditAccount[]>;

  // Atomic Ticketing Operation
  createTicketWithPayment(
    ticket: Ticket,
    walletUpdate?: { walletId: string; newBalance: number; transaction: WalletTransaction },
    creditUpdate?: { creditAccountId: string; newOutstandingCredit: number; newAvailableCredit: number }
  ): Promise<Ticket>;

  // Tickets
  getTicketById(ticketId: string): Promise<Ticket | null>;
  listTicketsByPassengerId(passengerId: string): Promise<Ticket[]>;
  listTicketsByConductorId(conductorEmployeeId: string): Promise<Ticket[]>;
  listAllTickets(): Promise<Ticket[]>;
  updateTicketStatus(ticketId: string, status: Ticket['status'], validatedBy?: string): Promise<Ticket | null>;

  // Withdrawals
  createWithdrawalRequest(req: WithdrawalRequest): Promise<WithdrawalRequest>;
  getWithdrawalRequestById(withdrawalId: string): Promise<WithdrawalRequest | null>;
  updateWithdrawalRequest(withdrawalId: string, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | null>;
  listWithdrawalRequests(): Promise<WithdrawalRequest[]>;

  // Notifications
  createNotification(notif: Notification): Promise<Notification>;
  listNotificationsByUserId(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;

  // Audit Logs
  createAuditLog(log: AuditLog): Promise<AuditLog>;
  listAuditLogs(limit?: number): Promise<AuditLog[]>;
}
