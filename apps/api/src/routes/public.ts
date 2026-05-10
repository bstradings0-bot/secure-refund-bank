import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '@srb/database';

const router: Router = Router();

/* ================================================================
   PUBLIC CONTACT FORM
   ================================================================ */

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

router.post('/contact', async (req: Request, res: Response) => {
  try {
    const data = contactSchema.parse(req.body);
    const msg = await prisma.contactMessage.create({ data });
    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. We will get back to you within 24 hours.',
      data: { id: msg.id },
    });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

/* ================================================================
   PUBLIC QUOTE REQUEST
   ================================================================ */

const quoteSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  industry: z.string().optional(),
  requirements: z.string().min(10, 'Please describe your requirements'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  employeeCount: z.string().optional(),
});

router.post('/quote', async (req: Request, res: Response) => {
  try {
    const data = quoteSchema.parse(req.body);
    const quote = await prisma.quoteRequest.create({ data });
    res.status(201).json({
      success: true,
      message: 'Thank you! Your quote request has been submitted. Our team will prepare a custom proposal within 1-2 business days.',
      data: { id: quote.id },
    });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

/* ================================================================
   PUBLIC NEWS / ANNOUNCEMENTS
   ================================================================ */

router.get('/news', async (_req: Request, res: Response) => {
  try {
    const articles = await prisma.announcement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        category: true,
        priority: true,
        createdAt: true,
      },
    });
    res.json({ success: true, data: articles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/news/:id', async (req: Request, res: Response) => {
  try {
    const article = await prisma.announcement.findFirst({
      where: { id: req.params.id, active: true },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        category: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, data: article });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
