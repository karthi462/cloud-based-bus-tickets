import { Request, Response } from 'express';
import { WalletService } from '../services/walletService.js';
import { CreditService } from '../services/creditService.js';
import { getRepository } from '../repositories/index.js';
import { AuditService } from '../services/auditService.js';

export class WalletController {
  /**
   * Get current user's wallet and credit status
   */
  static async getWalletDetails(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const repo = getRepository();
      const wallet = await repo.getWalletByUserId(userId);
      const creditAccount = await repo.getCreditAccountByUserId(userId);
      const transactions = await repo.listTransactionsByUserId(userId);

      res.json({
        success: true,
        wallet,
        creditAccount,
        recentTransactions: transactions.slice(0, 10),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Top up wallet
   */
  static async addMoney(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { amount, paymentMethod, idempotencyKey } = req.body;
      const parsedAmount = parseFloat(amount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ success: false, message: 'Valid positive amount is required' });
        return;
      }

      const result = await WalletService.addMoney(
        userId,
        parsedAmount,
        paymentMethod || 'Simulated Payment Gateway (Demo)',
        idempotencyKey
      );

      await AuditService.log('WALLET_TOPUP', 'WALLETS', {
        userId,
        amount: parsedAmount,
        replayed: result.replayed,
        transactionId: result.transaction.transactionId,
      }, {
        userId,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: result.replayed
          ? 'Transaction already processed (Idempotent response)'
          : `Successfully credited ₹${parsedAmount} to wallet`,
        ...result,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Request withdrawal from wallet
   */
  static async requestWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { amount, bankDetails } = req.body;
      const parsedAmount = parseFloat(amount);

      if (isNaN(parsedAmount) || parsedAmount <= 0 || !bankDetails) {
        res.status(400).json({ success: false, message: 'Valid amount and bank/UPI details are required' });
        return;
      }

      const request = await WalletService.requestWithdrawal(userId, parsedAmount, bankDetails);

      await AuditService.log('WITHDRAWAL_REQUEST', 'WITHDRAWALS', {
        userId,
        amount: parsedAmount,
        withdrawalId: request.withdrawalId,
      }, {
        userId,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Withdrawal request submitted for administrative review',
        withdrawal: request,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Admin processes withdrawal request
   */
  static async processWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { action, reason } = req.body;

      if (!action || !['APPROVE', 'REJECT'].includes(action)) {
        res.status(400).json({ success: false, message: 'Action must be APPROVE or REJECT' });
        return;
      }

      const result = await WalletService.processWithdrawal(
        id,
        action,
        req.user?.email || 'ADMIN',
        reason
      );

      await AuditService.log('WITHDRAWAL_PROCESSED', 'WITHDRAWALS', {
        withdrawalId: id,
        action,
        reason,
      }, {
        userId: req.user?.id,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: `Withdrawal request successfully ${action === 'APPROVE' ? 'approved and funds deducted' : 'rejected'}`,
        withdrawal: result,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Repay Emergency Travel Credit
   */
  static async repayCredit(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { amount, source } = req.body;
      const parsedAmount = parseFloat(amount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ success: false, message: 'Valid positive repayment amount is required' });
        return;
      }

      const repo = getRepository();
      const profile = await repo.getPassengerProfileByUserId(userId);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Passenger profile not found' });
        return;
      }

      const result = await CreditService.repayCredit(
        profile.passengerId,
        parsedAmount,
        source || 'WALLET'
      );

      await AuditService.log('CREDIT_REPAYMENT', 'CREDIT_ACCOUNTS', {
        passengerId: profile.passengerId,
        amount: parsedAmount,
        source,
      }, {
        userId,
        role: req.user?.role,
        ipAddress: req.ip,
      });

      res.json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * List Wallet Transactions
   */
  static async listTransactions(req: Request, res: Response): Promise<void> {
    try {
      const repo = getRepository();
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      let transactions = [];
      if (user.role === 'ADMIN') {
        transactions = await repo.listAllTransactions();
      } else {
        transactions = await repo.listTransactionsByUserId(user.id);
      }

      res.json({ success: true, transactions });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * List Withdrawal Requests (Admin or Passenger)
   */
  static async listWithdrawals(req: Request, res: Response): Promise<void> {
    try {
      const repo = getRepository();
      const user = req.user;

      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const all = await repo.listWithdrawalRequests();
      let filtered = all;

      if (user.role === 'PASSENGER') {
        filtered = all.filter((w) => w.userId === user.id);
      }

      res.json({ success: true, withdrawals: filtered });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
