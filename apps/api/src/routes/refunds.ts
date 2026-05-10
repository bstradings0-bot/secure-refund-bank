import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { refundService } from '../services/refund.service';
import { z } from 'zod';

const router: Router = Router();
router.use(authMiddleware);

// Submit a refund request for a received transaction
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      transactionId: z.string().min(1, 'Transaction ID is required'),
      reason: z.string().min(10, 'Please provide a reason (at least 10 characters)'),
    });
    const { transactionId, reason } = schema.parse(req.body);
    const refund = await refundService.submitRefund(req.userId!, transactionId, reason);
    res.status(201).json({ success: true, message: 'Refund request submitted', data: refund });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

// Get user's refund requests
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await refundService.getUserRefunds(req.userId!, page, limit);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get single refund detail
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const refund = await refundService.getRefundById(req.params.id, req.userId!);
    res.json({ success: true, data: refund });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

export default router;
