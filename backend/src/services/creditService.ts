import { getRepository } from '../repositories/index.js';
import { CreditAccount, User } from '../models/types.js';

export interface CreditEligibilityResult {
  eligible: boolean;
  reason?: string;
  creditAccount?: CreditAccount;
  newOutstandingCredit?: number;
  newAvailableCredit?: number;
}

export class CreditService {
  /**
   * Check if passenger is eligible for emergency travel credit for a specific fare.
   */
  static async evaluateCreditEligibility(
    passengerId: string,
    fare: number
  ): Promise<CreditEligibilityResult> {
    const repo = getRepository();
    const profile = await repo.getPassengerProfileByPassengerId(passengerId);
    if (!profile) {
      return { eligible: false, reason: `Passenger ${passengerId} profile not found` };
    }

    const user = await repo.getUserById(profile.userId);
    if (!user || user.status === 'SUSPENDED') {
      return { eligible: false, reason: 'Passenger account is suspended or inactive' };
    }

    let creditAccount = await repo.getCreditAccountByPassengerId(passengerId);
    if (!creditAccount) {
      // Initialize credit account if not exists
      creditAccount = await repo.createCreditAccount({
        creditAccountId: `crd-${passengerId}`,
        userId: profile.userId,
        passengerId,
        maxCreditLimit: 200,
        outstandingCredit: 0,
        availableCredit: 200,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (creditAccount.status === 'BLOCKED') {
      return {
        eligible: false,
        reason: 'Emergency travel credit is blocked on this account due to policy suspension',
        creditAccount,
      };
    }

    // Check if current outstanding credit already hit or exceeded limit
    if (creditAccount.outstandingCredit >= creditAccount.maxCreditLimit) {
      return {
        eligible: false,
        reason: `Maximum emergency credit limit of ₹${creditAccount.maxCreditLimit} has been reached. Current outstanding: ₹${creditAccount.outstandingCredit}. Repayment required before further travel.`,
        creditAccount,
      };
    }

    // Check if adding this fare would exceed the limit
    const projectedOutstanding = creditAccount.outstandingCredit + fare;
    if (projectedOutstanding > creditAccount.maxCreditLimit) {
      return {
        eligible: false,
        reason: `Transaction of ₹${fare} rejected: would exceed credit limit of ₹${creditAccount.maxCreditLimit}. Current outstanding is ₹${creditAccount.outstandingCredit}, available limit is ₹${creditAccount.availableCredit}.`,
        creditAccount,
      };
    }

    const newAvailable = creditAccount.maxCreditLimit - projectedOutstanding;

    return {
      eligible: true,
      creditAccount,
      newOutstandingCredit: projectedOutstanding,
      newAvailableCredit: newAvailable,
    };
  }

  /**
   * Repay outstanding travel credit.
   * Can be paid from wallet balance or directly via simulated payment.
   */
  static async repayCredit(
    passengerId: string,
    amount: number,
    source: 'WALLET' | 'DIRECT_PAYMENT' = 'WALLET'
  ): Promise<{ success: boolean; creditAccount: CreditAccount; message: string }> {
    const repo = getRepository();
    const creditAccount = await repo.getCreditAccountByPassengerId(passengerId);
    if (!creditAccount) {
      throw new Error(`Credit account not found for passenger ${passengerId}`);
    }

    if (amount <= 0) {
      throw new Error('Repayment amount must be positive');
    }

    if (creditAccount.outstandingCredit <= 0) {
      throw new Error('No outstanding credit balance to repay');
    }

    const repayAmount = Math.min(amount, creditAccount.outstandingCredit);

    if (source === 'WALLET') {
      const wallet = await repo.getWalletByPassengerId(passengerId);
      if (!wallet) throw new Error('Wallet not found');
      if (wallet.balance < repayAmount) {
        throw new Error(`Insufficient wallet balance (₹${wallet.balance}) to repay ₹${repayAmount}`);
      }

      // Deduct from wallet
      const newWalletBal = wallet.balance - repayAmount;
      await repo.updateWalletBalance(wallet.walletId, newWalletBal);

      // Record transaction
      await repo.createWalletTransaction({
        transactionId: `tx-repay-${Date.now()}`,
        walletId: wallet.walletId,
        userId: wallet.userId,
        amount: repayAmount,
        type: 'CREDIT_REPAYMENT',
        referenceId: `CRD-REPAY-${passengerId}`,
        balanceBefore: wallet.balance,
        balanceAfter: newWalletBal,
        status: 'SUCCESS',
        description: `Repayment of ₹${repayAmount} toward emergency travel credit`,
        createdAt: new Date().toISOString(),
      });
    }

    const newOutstanding = creditAccount.outstandingCredit - repayAmount;
    const newAvailable = creditAccount.maxCreditLimit - newOutstanding;

    const updatedAccount = await repo.updateCreditAccount(creditAccount.creditAccountId, {
      outstandingCredit: newOutstanding,
      availableCredit: newAvailable,
      status: 'ACTIVE',
      lastRepaymentDate: new Date().toISOString(),
    });

    if (!updatedAccount) {
      throw new Error('Failed to update credit account');
    }

    return {
      success: true,
      creditAccount: updatedAccount,
      message: `Successfully repaid ₹${repayAmount}. New outstanding credit is ₹${newOutstanding}.`,
    };
  }

  /**
   * Update maximum credit limit for a passenger (Admin feature)
   */
  static async updateCreditLimit(
    passengerId: string,
    newLimit: number
  ): Promise<CreditAccount> {
    const repo = getRepository();
    const account = await repo.getCreditAccountByPassengerId(passengerId);
    if (!account) throw new Error('Credit account not found');

    if (newLimit < account.outstandingCredit) {
      throw new Error(`Cannot set credit limit lower than existing outstanding credit (₹${account.outstandingCredit})`);
    }

    const newAvailable = newLimit - account.outstandingCredit;
    const updated = await repo.updateCreditAccount(account.creditAccountId, {
      maxCreditLimit: newLimit,
      availableCredit: newAvailable,
    });
    return updated!;
  }
}
