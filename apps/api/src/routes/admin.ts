import { Router, Response, Request } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';
import { adminService } from '../services/admin.service';
import { cardService } from '../services/card.service';
import { kycService } from '../services/kyc.service';
import { disputeService } from '../services/dispute.service';
import { complianceService } from '../services/compliance.service';
import { Role } from '@srb/shared';
import { z } from 'zod';
import prisma from '@srb/database';

const router: Router = Router();

/* ================================================================
   ADMIN AUTH — PUBLIC (no auth required)
   ================================================================ */

const adminLoginSchema = z.object({
  email: z.string().email('Valid admin email is required'),
  password: z.string().min(1, 'Password is required'),
  otpCode: z.string().optional(),
});

// POST /api/admin/login — dedicated admin login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = adminLoginSchema.parse(req.body);
    const result = await adminService.adminLogin(data.email, data.password, data.otpCode);

    if ('requires2FA' in result) {
      return res.json({
        success: true,
        message: '2FA required. Enter the OTP code sent to your admin device.',
        data: result,
      });
    }

    res.json({
      success: true,
      message: 'Admin login successful',
      data: result,
    });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(401).json({ success: false, message });
  }
});

/* ================================================================
   PROTECTED ADMIN ROUTES — auth + admin role required below
   ================================================================ */

router.use(authMiddleware);
router.use(roleMiddleware(Role.ADMIN));

/* ================================================================
   USER MANAGEMENT
   ================================================================ */

// GET /api/admin/users — list or search users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const users = await adminService.getUsers(search);
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users/:id — single user detail
router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/admin/users — create user manually
router.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      phone: z.string().optional(),
      country: z.string().optional(),
      role: z.enum(['USER', 'ADMIN']).optional(),
    });
    const data = schema.parse(req.body);
    const user = await adminService.createUser(data);
    res.status(201).json({ success: true, message: 'User created', data: user });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

// DELETE /api/admin/users/:id — permanently delete user
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.deleteUser(req.params.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/users/:id/suspend — suspend/unsuspend user
router.patch('/users/:id/suspend', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.suspendUser(req.params.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ================================================================
   TRANSACTIONS
   ================================================================ */

router.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await adminService.getAllTransactions(page, limit);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ================================================================
   BALANCE OPERATIONS — CREDIT
   ================================================================ */

router.post('/users/:id/credit', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      amount: z.number().positive('Amount must be positive'),
      currency: z.string().default('USD'),
      description: z.string().optional(),
      reason: z.string().optional(),
    });
    const { amount, currency, description, reason } = schema.parse(req.body);
    const result = await adminService.creditUser(req.userId!, req.params.id, amount, currency, description, reason);
    res.json({ success: true, ...result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

/* ================================================================
   BALANCE OPERATIONS — DEBIT
   ================================================================ */

router.post('/users/:id/debit', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      amount: z.number().positive('Amount must be positive'),
      currency: z.string().default('USD'),
      reason: z.string().min(3, 'Reason is required for debits'),
      description: z.string().optional(),
    });
    const { amount, currency, reason, description } = schema.parse(req.body);
    const result = await adminService.debitUser(req.userId!, req.params.id, amount, currency, reason, description);
    res.json({ success: true, ...result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

/* ================================================================
   BALANCE OPERATIONS — EDIT BALANCE
   ================================================================ */

router.patch('/users/:id/balance', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      balanceType: z.enum(['balance', 'savingsBalance']),
      value: z.number().min(0, 'Balance cannot be negative'),
    });
    const { balanceType, value } = schema.parse(req.body);
    const result = await adminService.editBalance(req.params.id, balanceType, value);
    res.json({ success: true, ...result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

/* ================================================================
   FREEZE / UNFREEZE
   ================================================================ */

router.patch('/users/:id/freeze', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.freezeUser(req.params.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ================================================================
   REFUND MANAGEMENT
   ================================================================ */

// List all refunds with optional status filter
router.get('/refunds', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await adminService.getRefunds(page, limit, status);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Approve or reject a refund
router.patch('/refunds/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      action: z.enum(['APPROVED', 'REJECTED']),
    });
    const { action } = schema.parse(req.body);
    const result = await adminService.processRefund(req.params.id, action);
    res.json({ success: true, ...result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

/* ================================================================
   ACTIVITY LOGS
   ================================================================ */

router.get('/activity-logs', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const userId = req.query.userId as string | undefined;
    const result = await adminService.getActivityLogs(page, limit, userId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ================================================================
   ANALYTICS
   ================================================================ */

router.get('/analytics', async (_req: AuthRequest, res: Response) => {
  try {
    const analytics = await adminService.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ================================================================
   ANNOUNCEMENTS
   ================================================================ */

router.get('/announcements', async (_req: AuthRequest, res: Response) => {
  try {
    const announcements = await adminService.getAnnouncements();
    res.json({ success: true, data: announcements });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/announcements', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(3),
      content: z.string().min(10),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
    });
    const { title, content, priority } = schema.parse(req.body);
    const announcement = await adminService.createAnnouncement(title, content, priority, req.userId!);
    res.status(201).json({ success: true, data: announcement });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

router.delete('/announcements/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.deleteAnnouncement(req.params.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/announcements/:id/toggle', async (req: AuthRequest, res: Response) => {
  try {
    const announcement = await adminService.toggleAnnouncement(req.params.id);
    res.json({ success: true, data: announcement });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ================================================================
   CARD MANAGEMENT
   ================================================================ */

// GET /api/admin/cards — list all cards with optional status filter
router.get('/cards', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await cardService.getAllCards(page, limit, status);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/cards/:id/freeze — freeze/unfreeze any card
router.patch('/cards/:id/freeze', async (req: AuthRequest, res: Response) => {
  try {
    const card = await cardService.adminFreezeCard(req.params.id);
    res.json({ success: true, data: card });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/cards/:id — permanently delete any card
router.delete('/cards/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await cardService.adminDeleteCard(req.params.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/cards/:id/balance — edit card balance
router.patch('/cards/:id/balance', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      balance: z.number().min(0, 'Balance cannot be negative'),
    });
    const { balance } = schema.parse(req.body);
    const card = await cardService.adminEditCardBalance(req.params.id, balance);
    res.json({ success: true, data: card });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

// GET /api/admin/cards/analytics — card analytics overview
router.get('/cards/analytics', async (_req: AuthRequest, res: Response) => {
  try {
    const cards = await cardService.getAllCards(1, 1000);
    const totalCards = cards.total;
    const activeCards = cards.cards.filter((c: any) => c.status === 'ACTIVE').length;
    const frozenCards = cards.cards.filter((c: any) => c.status === 'FROZEN').length;
    const cancelledCards = cards.cards.filter((c: any) => c.status === 'CANCELLED').length;
    const byType: Record<string, number> = {};
    cards.cards.forEach((c: any) => {
      byType[c.cardType] = (byType[c.cardType] || 0) + 1;
    });
    res.json({
      success: true,
      data: { totalCards, activeCards, frozenCards, cancelledCards, byType },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ================================================================
   KYC REVIEW
   ================================================================ */

// GET /api/admin/kyc/pending — list all pending KYC reviews
router.get('/kyc/pending', async (_req: AuthRequest, res: Response) => {
  try {
    const result = await kycService.getPendingReviews();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/admin/kyc/:id — view single KYC submission with documents
router.get('/kyc/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await kycService.getKycById(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/kyc/:id/approve — approve KYC
router.patch('/kyc/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      notes: z.string().optional(),
    });
    const { notes } = schema.parse(req.body);
    const result = await kycService.approveKyc(req.params.id, req.userId!, notes);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

// PATCH /api/admin/kyc/:id/reject — reject KYC
router.patch('/kyc/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      reason: z.string().min(3, 'Rejection reason is required'),
    });
    const { reason } = schema.parse(req.body);
    const result = await kycService.rejectKyc(req.params.id, req.userId!, reason);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

/* ================================================================
   DISPUTE MANAGEMENT
   ================================================================ */

// GET /api/admin/disputes — list all disputes
router.get('/disputes', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await disputeService.getDisputes(page, limit, status);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/admin/disputes/:id — view single dispute
router.get('/disputes/:id', async (req: AuthRequest, res: Response) => {
  try {
    const dispute = await disputeService.getDisputeById(req.params.id);
    res.json({ success: true, data: dispute });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/disputes/:id/resolve — resolve dispute
router.patch('/disputes/:id/resolve', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      resolution: z.string().min(3, 'Resolution is required'),
      resolvedFor: z.enum(['USER', 'PLATFORM']),
    });
    const { resolution, resolvedFor } = schema.parse(req.body);
    const result = await disputeService.resolveDispute(req.params.id, req.userId!, resolution, resolvedFor);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

// PATCH /api/admin/disputes/:id/request-evidence — request evidence
router.patch('/disputes/:id/request-evidence', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      notes: z.string().min(3, 'Notes are required'),
    });
    const { notes } = schema.parse(req.body);
    const result = await disputeService.requestEvidence(req.params.id, req.userId!, notes);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

/* ================================================================
   COMPLIANCE
   ================================================================ */

// GET /api/admin/compliance/dashboard — compliance overview
router.get('/compliance/dashboard', async (_req: AuthRequest, res: Response) => {
  try {
    const dashboard = await complianceService.getComplianceDashboard();
    res.json({ success: true, data: dashboard });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/admin/compliance/sar-report — generate SAR report
router.get('/compliance/sar-report', async (req: AuthRequest, res: Response) => {
  try {
    const startDate = (req.query.startDate as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = (req.query.endDate as string) || new Date().toISOString().split('T')[0];
    const report = await complianceService.generateSarReport(startDate, endDate);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/admin/compliance/risk-assessment/:userId — assess user risk
router.post('/compliance/risk-assessment/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const result = await complianceService.assessRisk(req.params.userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ================================================================
   WEBHOOK EVENT LOGS
   ================================================================ */

// GET /api/admin/webhooks — view webhook event logs
router.get('/webhooks', async (req: AuthRequest, res: Response) => {
  try {
    const { prisma } = await import('@srb/database');
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const provider = req.query.provider as string | undefined;
    const where: any = {};
    if (provider) where.provider = provider;

    const [events, total] = await Promise.all([
      prisma.webhookEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          provider: true,
          eventType: true,
          eventId: true,
          status: true,
          processedAt: true,
          errorMessage: true,
          retryCount: true,
          createdAt: true,
        },
      }),
      prisma.webhookEvent.count({ where }),
    ]);

    res.json({ success: true, data: events, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});


/* ================================================================
   ANNOUNCEMENTS / NEWS MANAGEMENT
   ================================================================ */

router.get('/announcements', async (_req: AuthRequest, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: announcements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/announcements', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(3),
      content: z.string().min(10),
      summary: z.string().optional(),
      category: z.string().optional(),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
    });
    const data = schema.parse(req.body);
    const announcement = await prisma.announcement.create({ data: { ...data, createdBy: req.userId! } });
    res.status(201).json({ success: true, data: announcement });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

router.patch('/announcements/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(3).optional(),
      content: z.string().min(10).optional(),
      summary: z.string().optional(),
      category: z.string().optional(),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
      active: z.boolean().optional(),
    });
    const data = schema.parse(req.body);
    const announcement = await prisma.announcement.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: announcement });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

router.delete('/announcements/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ================================================================
   CONTACT MESSAGES & QUOTE REQUESTS
   ================================================================ */

router.get('/contacts', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.contactMessage.count(),
    ]);
    res.json({ success: true, data: messages, total, page, limit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/quotes', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const [quotes, total] = await Promise.all([
      prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.quoteRequest.count(),
    ]);
    res.json({ success: true, data: quotes, total, page, limit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
