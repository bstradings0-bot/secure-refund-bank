import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { initializeSocket } from './socket';
import authRoutes from './routes/auth';
import accountRoutes from './routes/account';
import transactionRoutes from './routes/transactions';
import cardRoutes from './routes/cards';
import adminRoutes from './routes/admin';
import refundRoutes from './routes/refunds';
import kycRoutes from './routes/kyc';
import paymentRoutes from './routes/payments';
import webhookRoutes from './routes/webhooks';
import publicRoutes from './routes/public';
import healthRoutes from './routes/health';
import { refundService } from './services/refund.service';

const app: express.Application = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = initializeSocket(httpServer);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.stripe.com', 'https://*.plaid.com', 'https://api.wise.com', 'https://*.transferwise.tech'],
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com', 'https://*.plaid.com'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // In development, allow all origins including file:// (null origin)
    const allowed = [env.CORS_ORIGIN, 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:3000', 'http://127.0.0.1:5500'];
    if (!origin || allowed.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else if (env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 500 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
}));

// Webhooks must be BEFORE body parsing for Stripe's raw body requirement
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.COOKIE_SECRET));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'SecureRefund Bank API is running', timestamp: new Date().toISOString() });
});

// Public announcements (no auth required)
app.get('/api/announcements', async (_req: Request, res: Response) => {
  try {
    const announcements = await refundService.getPublicAnnouncements();
    res.json({ success: true, data: announcements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);
app.use('/api', healthRoutes);

// Error handler
app.use(errorHandler);

// Start server
httpServer.listen(env.PORT, () => {
  console.log(`SecureRefund Bank API running on port ${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`CORS origin: ${env.CORS_ORIGIN}`);
});

export { app, httpServer, io };
