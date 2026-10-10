import { getRepository } from '../repositories/index.js';
import { Wallet, WalletTransaction, WithdrawalRequest } from '../models/types.js';
import { generateId } from '../utils/crypto.js';
import { CONFIG } from '../config/constants.js';

export class WalletService {
  /**
   * Top up wallet with idempotency check
   */
  static async addMoney(
    userId: string,
    amount: number,
    paymentMethod: string = 'DEMO_SIMULATION',
    idempotencyKey?: string
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction; replayed?: boolean }> {
    const repo = getRepository();

    if (amount < CONFIG.MIN_ADD_MONEY) {
      throw new Error(`Minimum top-up amount is ₹${CONFIG.MIN_ADD_MONEY}`);
    }
    if (amount > CONFIG.MAX_ADD_MONEY) {
      throw new Error(`Maximum single top-up amount is ₹${CONFIG.MAX_ADD_MONEY}`);
    }

    // Check idempotency to prevent duplicate credit / replayed webhook
    if (idempotencyKey) {
      const existingTx = await repo.getTransactionByIdempotencyKey(idempotencyKey);
      if (existingTx) {
        const wallet = await repo.getWalletByUserId(userId);
        return {
          wallet: wallet!,
          transaction: existingTx,
          replayed: true,
        };
      }
    }

    const wallet = await repo.getWalletByUserId(userId);
    if (!wallet) {
      throw new Error('Wallet not found for user');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    const tx: WalletTransaction = {
      transactionId: generateId('TX-TOPUP'),
      walletId: wallet.walletId,
      userId,
      amount,
      type: 'ADD_MONEY',
      referenceId: generateId('PAY-ORDER'),
      balanceBefore,
      balanceAfter,
      status: 'SUCCESS',
      description: `Wallet top-up of ₹${amount} via ${paymentMethod}`,
      idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    const updatedWallet = await repo.updateWalletBalance(wallet.walletId, balanceAfter);
    await repo.createWalletTransaction(tx);

    return {
      wallet: updatedWallet!,
      transaction: tx,
      replayed: false,
    };
  }

  /**
   * Submit withdrawal request
   */
  static async requestWithdrawal(
    userId: string,
    amount: number,
    bankDetails: string
  ): Promise<WithdrawalRequest> {
    const repo = getRepository();
    const wallet = await repo.getWalletByUserId(userId);
    if (!wallet) throw new Error('Wallet not found');

    if (amount < CONFIG.MIN_WITHDRAWAL) {
      throw new Error(`Minimum withdrawal amount is ₹${CONFIG.MIN_WITHDRAWAL}`);
    }
    if (amount > CONFIG.MAX_WITHDRAWAL) {
      throw new Error(`Maximum withdrawal amount is ₹${CONFIG.MAX_WITHDRAWAL}`);
    }
    if (wallet.balance < amount) {
      throw new Error(`Insufficient wallet balance (₹${wallet.balance}) for requested withdrawal of ₹${amount}`);
    }

    const request: WithdrawalRequest = {
      withdrawalId: generateId('WTH'),
      userId,
      passengerId: wallet.passengerId,
      amount,
      status: 'PENDING',
      bankDetails,
      requestedAt: new Date().toISOString(),
    };

    return repo.createWithdrawalRequest(request);
  }

  /**
   * Admin approves or rejects a withdrawal request
   */
  static async processWithdrawal(
    withdrawalId: string,
    action: 'APPROVE' | 'REJECT',
    adminEmployeeId: string,
    reason?: string
  ): Promise<WithdrawalRequest> {
    const repo = getRepository();
    const req = await repo.getWithdrawalRequestById(withdrawalId);
    if (!req) throw new Error('Withdrawal request not found');

    if (req.status !== 'PENDING') {
      throw new Error(`Withdrawal request has already been ${req.status}`);
    }

    if (action === 'REJECT') {
      const updated = await repo.updateWithdrawalRequest(withdrawalId, {
        status: 'REJECTED',
        reviewedBy: adminEmployeeId,
        reason: reason || 'Rejected by Administrator',
      });
      return updated!;
    }

    // Process Approval
    const wallet = await repo.getWalletByPassengerId(req.passengerId);
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.balance < req.amount) {
      throw new Error(`Insufficient balance at time of processing. Available: ₹${wallet.balance}`);
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - req.amount;

    await repo.updateWalletBalance(wallet.walletId, balanceAfter);

    await repo.createWalletTransaction({
      transactionId: generateId('TX-WTH'),
      walletId: wallet.walletId,
      userId: wallet.userId,
      amount: req.amount,
      type: 'WITHDRAWAL',
      referenceId: req.withdrawalId,
      balanceBefore,
      balanceAfter,
      status: 'SUCCESS',
      description: `Withdrawal of ₹${req.amount} processed to ${req.bankDetails}`,
      createdAt: new Date().toISOString(),
    });

    const updated = await repo.updateWithdrawalRequest(withdrawalId, {
      status: 'APPROVED',
      reviewedBy: adminEmployeeId,
      reason: reason || 'Approved and processed to bank account',
    });

    return updated!;
  }
}
