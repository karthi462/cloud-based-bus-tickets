import { Router } from 'express';
import { WalletController } from '../controllers/walletController.js';
import { authenticateJwt, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Wallet details & balance
router.get('/details', authenticateJwt, WalletController.getWalletDetails);

// Add money (Passenger)
router.post('/topup', authenticateJwt, WalletController.addMoney);

// Request withdrawal (Passenger)
router.post('/withdraw', authenticateJwt, WalletController.requestWithdrawal);

// Process withdrawal (Admin only)
router.post(
  '/withdrawals/:id/process',
  authenticateJwt,
  requirePermission('APPROVE_WITHDRAWALS'),
  WalletController.processWithdrawal
);

// Repay emergency travel credit (Passenger)
router.post('/credit/repay', authenticateJwt, WalletController.repayCredit);

// List transactions
router.get('/transactions', authenticateJwt, WalletController.listTransactions);

// List withdrawal requests
router.get('/withdrawals', authenticateJwt, WalletController.listWithdrawals);

export default router;
