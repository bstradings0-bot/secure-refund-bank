import bcrypt from 'bcryptjs';
import prisma from '@srb/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { generateOtpCode } from '../utils/helpers';
import type { RegisterRequest, LoginRequest, JwtPayload } from '@srb/shared';

export class AuthService {
  async register(data: RegisterRequest) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        country: data.country || 'US',
        account: {
          create: {
            accountNumber: `SRB${String(Math.floor(10000000 + Math.random() * 90000000))}`,
            balance: 0.00,
            savingsBalance: 0.00,
            currency: 'USD',
          },
        },
      },
      include: {
        account: true,
      },
    });

    // Generate demo verification OTP
    const otp = await prisma.otp.create({
      data: {
        userId: user.id,
        code: generateOtpCode(),
        type: 'EMAIL',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role as JwtPayload['role'] };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        account: user.account,
      },
      accessToken,
      refreshToken,
      otpCode: otp.code,
    };
  }

  async login(data: LoginRequest) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { account: true },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    if (user.twoFactorEnabled) {
      if (!data.otpCode) {
        // Generate and return OTP request
        const otp = await prisma.otp.create({
          data: {
            userId: user.id,
            code: generateOtpCode(),
            type: 'TWO_FA',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
        return { requires2FA: true, userId: user.id, otpCode: otp.code };
      }

      // Verify OTP
      const validOtp = await prisma.otp.findFirst({
        where: {
          userId: user.id,
          code: data.otpCode,
          type: 'TWO_FA',
          used: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!validOtp) {
        throw new Error('Invalid or expired OTP code');
      }

      await prisma.otp.update({ where: { id: validOtp.id }, data: { used: true } });
    }

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        ipAddress: '127.0.0.1',
        userAgent: 'Browser',
      },
    });

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role as JwtPayload['role'] };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        account: user.account,
      },
      accessToken,
      refreshToken,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { account: true },
    });

    if (!user) throw new Error('User not found');

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      kycStatus: user.kycStatus,
      account: user.account,
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('No account found with this email');

    const otp = await prisma.otp.create({
      data: {
        userId: user.id,
        code: generateOtpCode(),
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return { message: 'Reset code sent', otpCode: otp.code };
  }

  async resetPassword(email: string, otpCode: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const validOtp = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        code: otpCode,
        type: 'PASSWORD_RESET',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validOtp) throw new Error('Invalid or expired reset code');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    await prisma.otp.update({ where: { id: validOtp.id }, data: { used: true } });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(otpCode: string) {
    const otp = await prisma.otp.findFirst({
      where: { code: otpCode, type: 'EMAIL', used: false, expiresAt: { gt: new Date() } },
    });
    if (!otp) throw new Error('Invalid or expired verification code');

    await prisma.user.update({ where: { id: otp.userId }, data: { emailVerified: true } });
    await prisma.otp.update({ where: { id: otp.id }, data: { used: true } });

    return { message: 'Email verified successfully' };
  }

  async setup2FA(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
    return { message: '2FA enabled successfully' };
  }

  async disable2FA(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: false } });
    return { message: '2FA disabled successfully' };
  }

  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    country?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.country && { country: data.country }),
      },
      include: { account: true },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      country: user.country,
      role: user.role,
      kycStatus: user.kycStatus,
      twoFactorEnabled: user.twoFactorEnabled,
      account: user.account,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

    return { message: 'Password changed successfully' };
  }

  async refreshTokens(refreshToken: string) {
    const { verifyRefreshToken } = await import('../utils/jwt');
    const decoded = verifyRefreshToken(refreshToken);

    const payload: JwtPayload = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}

export const authService = new AuthService();
