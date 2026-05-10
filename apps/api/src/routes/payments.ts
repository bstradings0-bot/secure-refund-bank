import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { paymentService } from '../services/payment.service';
import { plaidService } from '../services/plaid.service';
import { z } from 'zod';

const router: Router = Router();

router.use(authMiddleware);

// GET /api/payments/wallets - List user wallets
router.get('/wallets', async (req: AuthRequest, res: Response) => {
  try {
    const wallets = await paymentService.getWallets(req.userId!);
    res.json({ success: true, data: wallets });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/payments/deposit - Initiate deposit
router.post('/deposit', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      amount: z.number().positive(),
      currency: z.string().default('USD'),
      method: z.enum(['CARD', 'ACH', 'STRIPE', 'WISE']),
      bankAccountId: z.string().optional(),
    });
    const { amount, currency, method, bankAccountId } = schema.parse(req.body);
    const result = await paymentService.initiateDeposit(req.userId!, amount, method, currency, bankAccountId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

// POST /api/payments/deposit/confirm - Confirm deposit
router.post('/deposit/confirm', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      paymentIntentId: z.string().min(1),
    });
    const { paymentIntentId } = schema.parse(req.body);
    const result = await paymentService.confirmDeposit(req.userId!, paymentIntentId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

// POST /api/payments/withdrawal - Request withdrawal
router.post('/withdrawal', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      amount: z.number().positive(),
      currency: z.string().default('USD'),
      bankAccountId: z.string().min(1, 'Bank account is required'),
    });
    const { amount, currency, bankAccountId } = schema.parse(req.body);
    const result = await paymentService.requestWithdrawal(req.userId!, amount, currency, bankAccountId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

// GET /api/payments/transactions - Payment history
router.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await paymentService.getPaymentHistory(req.userId!, page, limit);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/payments/bank/link-token - Get Plaid Link token
router.post('/bank/link-token', async (req: AuthRequest, res: Response) => {
  try {
    const linkToken = await plaidService.createLinkToken(req.userId!);
    res.json({
      success: true,
      data: { linkToken, expiration: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/payments/bank/exchange - Exchange Plaid public token
router.post('/bank/exchange', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      publicToken: z.string().min(1),
      institutionId: z.string().min(1),
      institutionName: z.string().min(1),
    });
    const { publicToken, institutionId, institutionName } = schema.parse(req.body);
    const result = await plaidService.exchangePublicToken(publicToken, req.userId!, institutionId, institutionName);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

// GET /api/payments/bank/accounts - List linked bank accounts
router.get('/bank/accounts', async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await plaidService.getAccounts(req.userId!);
    res.json({ success: true, data: accounts });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/payments/bank/:id - Unlink a bank account
router.delete('/bank/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await plaidService.unlinkAccount(req.params.id, req.userId!);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
