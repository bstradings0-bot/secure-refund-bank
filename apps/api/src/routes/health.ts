import { Router, Request, Response } from 'express';
import prisma from '@srb/database';

const router: Router = Router();

/**
 * GET /api/health
 * Health check endpoint for monitoring and load balancers
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get database stats
    const userCount = await prisma.user.count();
    const transactionCount = await prisma.transaction.count();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        userCount,
        transactionCount,
      },
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error.message,
      },
      uptime: process.uptime(),
    });
  }
});

/**
 * GET /api/health/ready
 * Readiness probe - checks if app is ready to receive traffic
 */
router.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(503).json({ 
      status: 'not_ready', 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

/**
 * GET /api/health/live
 * Liveness probe - checks if app is alive
 */
router.get('/health/live', (_req: Request, res: Response) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

export default router;
