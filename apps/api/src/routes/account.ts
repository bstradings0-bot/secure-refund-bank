import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { accountService } from '../services/account.service';
import prisma from '@srb/database';

const router: Router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const account = await accountService.getAccount(req.userId!);
    res.json({ success: true, data: account });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const dashboard = await accountService.getDashboard(req.userId!);
    res.json({ success: true, data: dashboard });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.get('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.userId! },
      data: { read: true },
    });
    res.json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/notifications/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId!, read: false },
      data: { read: true },
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
