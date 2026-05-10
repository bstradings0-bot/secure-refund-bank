import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { transactionService } from '../services/transaction.service';
import { z } from 'zod';
import { TransactionType } from '@srb/shared';

const router: Router = Router();
router.use(authMiddleware);

const transferSchema = z.object({
  receiverEmail: z.string().email(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  type: z.nativeEnum(TransactionType).default(TransactionType.INTERNAL),
  description: z.string().optional(),
});

router.post('/transfer', async (req: AuthRequest, res: Response) => {
  try {
    const data = transferSchema.parse(req.body);
    const transaction = await transactionService.transfer(req.userId!, data);
    res.status(201).json({ success: true, message: 'Transfer completed', data: transaction });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

router.post('/deposit', async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid amount required' });
    const result = await transactionService.deposit(req.userId!, amount);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/withdraw', async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid amount required' });
    const result = await transactionService.withdraw(req.userId!, amount);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await transactionService.getTransactions(req.userId!, page, limit);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const tx = await transactionService.getTransactionById(req.params.id);
    res.json({ success: true, data: tx });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

export default router;
