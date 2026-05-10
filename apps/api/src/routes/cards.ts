import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { cardService } from '../services/card.service';
import { z } from 'zod';
import { CardType } from '@srb/shared';

const router: Router = Router();
router.use(authMiddleware);

const createCardSchema = z.object({
  cardType: z.nativeEnum(CardType),
  colorTheme: z.string().optional(),
  spendingLimit: z.number().positive().optional(),
  initialBalance: z.number().min(0).optional(),
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createCardSchema.parse(req.body);
    const card = await cardService.createCard(req.userId!, data);
    res.status(201).json({ success: true, message: 'Card created successfully', data: card });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const cards = await cardService.getCards(req.userId!);
    res.json({ success: true, data: cards });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const card = await cardService.getCard(req.params.id);
    res.json({ success: true, data: card });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.get('/:id/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const analytics = await cardService.getCardAnalytics(req.params.id);
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.patch('/:id/freeze', async (req: AuthRequest, res: Response) => {
  try {
    const card = await cardService.freezeCard(req.params.id);
    res.json({ success: true, data: card, message: card.status === 'FROZEN' ? 'Card frozen' : 'Card unfrozen' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/:id/limit', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({ limit: z.number().positive('Limit must be positive') });
    const { limit } = schema.parse(req.body);
    const card = await cardService.updateLimit(req.params.id, limit);
    res.json({ success: true, data: card });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

router.patch('/:id/rename', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({ label: z.string().min(1, 'Card label is required').max(50) });
    const { label } = schema.parse(req.body);
    const card = await cardService.renameCard(req.params.id, label);
    res.json({ success: true, data: card });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

router.patch('/:id/color-theme', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({ colorTheme: z.string().min(1) });
    const { colorTheme } = schema.parse(req.body);
    const card = await cardService.updateColorTheme(req.params.id, colorTheme);
    res.json({ success: true, data: card });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const card = await cardService.cancelCard(req.params.id);
    res.json({ success: true, data: card, message: 'Card cancelled' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
