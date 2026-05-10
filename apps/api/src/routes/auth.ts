import { Router, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router: Router = Router();

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
  otpCode: z.string().optional(),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json({
      success: true,
      message: 'Registration successful. Use OTP to verify.',
      data: result,
    });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    if ('requires2FA' in result) {
      return res.json({
        success: true,
        message: '2FA required. Enter the OTP sent to your device.',
        data: result,
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(401).json({ success: false, message });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getMe(req.userId!);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }
    const tokens = await authService.refreshTokens(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const result = await authService.forgotPassword(email);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required' });
    }
    const result = await authService.resetPassword(email, otpCode, newPassword);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Verification code required' });
    const result = await authService.verifyEmail(code);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/2fa/setup', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await authService.setup2FA(req.userId!);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/2fa/disable', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await authService.disable2FA(req.userId!);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      firstName: z.string().min(2).optional(),
      lastName: z.string().min(2).optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      country: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const result = await authService.updateProfile(req.userId!, data);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

router.patch('/change-password', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    });
    const { currentPassword, newPassword } = schema.parse(req.body);
    const result = await authService.changePassword(req.userId!, currentPassword, newPassword);
    res.json({ success: true, ...result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
