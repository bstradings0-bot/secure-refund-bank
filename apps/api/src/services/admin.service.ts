import prisma from '@srb/database';
import bcrypt from 'bcryptjs';
import { generateReferenceNumber, generateAccountNumber, generateOtpCode } from '../utils/helpers';
import { getIO } from '../socket';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import type { JwtPayload } from '@srb/shared';

export class AdminService {
  /* ================================================================
     ADMIN AUTH
     ================================================================ */

  async adminLogin(email: string, password: string, otpCode?: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { account: true },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.role !== 'ADMIN') {
      throw new Error('Access denied: administrator privileges required');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    if (user.suspended) {
      throw new Error('This admin account has been suspended. Contact super administrator.');
    }

    // Handle 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!otpCode) {
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

      const validOtp = await prisma.otp.findFirst({
        where: {
          userId: user.id,
          code: otpCode,
          type: 'TWO_FA',
          used: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!validOtp) {
        throw new Error('Invalid or expired 2FA code');
      }

      await prisma.otp.update({ where: { id: validOtp.id }, data: { used: true } });
    }

    // Log admin login activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'ADMIN_LOGIN',
        ipAddress: '127.0.0.1',
        userAgent: 'Admin Panel',
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

  /* ================================================================
     USER MANAGEMENT
     ================================================================ */

  async getUsers(search?: string) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return prisma.user.findMany({
      where,
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        country: true, role: true, kycStatus: true, emailVerified: true,
        suspended: true, createdAt: true,
        account: {
          select: {
            id: true, accountNumber: true, balance: true,
            savingsBalance: true, status: true, currency: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        account: true,
        cards: { orderBy: { createdAt: 'desc' } },
        refundRequests: { orderBy: { createdAt: 'desc' }, take: 20 },
        notifications: { orderBy: { createdAt: 'desc' }, take: 20 },
        activityLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!user) throw new Error('User not found');
    const { password, ...safe } = user;
    return safe;
  }

  async createUser(data: {
    email: string; password: string; firstName: string; lastName: string;
    phone?: string; country?: string; role?: 'USER' | 'ADMIN';
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const accountNumber = generateAccountNumber();

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        country: data.country || 'US',
        role: data.role || 'USER',
        emailVerified: true,
        account: {
          create: {
            accountNumber,
            balance: 0.00,
            savingsBalance: 0.00,
            currency: 'USD',
          },
        },
      },
      include: { account: true },
    });

    const { password: _, ...safe } = user;
    return safe;
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    await prisma.user.delete({ where: { id: userId } });
    return { message: 'User permanently deleted' };
  }

  async suspendUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { suspended: !user.suspended },
    });

    await prisma.activityLog.create({
      data: { userId, action: updated.suspended ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_UNSUSPENDED' },
    });

    return { message: updated.suspended ? 'User suspended' : 'User unsuspended', suspended: updated.suspended };
  }

  /* ================================================================
     TRANSACTION MANAGEMENT
     ================================================================ */

  async getAllTransactions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          sender: { select: { firstName: true, lastName: true, email: true } },
          receiver: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.transaction.count(),
    ]);
    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /* ================================================================
     BALANCE OPERATIONS — CREDIT
     ================================================================ */

  async creditUser(
    adminUserId: string,
    userId: string,
    amount: number,
    currency = 'USD',
    description?: string,
    reason?: string
  ) {
    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) throw new Error('Account not found');
    if (amount <= 0) throw new Error('Amount must be positive');
    if (account.status === 'FROZEN') throw new Error('Cannot credit a frozen account');

    const referenceNumber = generateReferenceNumber();

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          senderId: adminUserId,
          receiverId: userId,
          amount,
          currency,
          type: 'INTERNAL',
          status: 'COMPLETED',
          referenceNumber,
          description: description || `Admin credit — ${reason || 'Manual adjustment'}`,
          reason: reason || null,
        },
      }),
      prisma.account.update({
        where: { userId },
        data: { balance: { increment: amount } },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId,
        title: 'Account Credited',
        message: `Admin credited ${currency} ${amount.toFixed(2)} to your account${description ? ': ' + description : ''}`,
        type: 'TRANSACTION',
      },
    });

    await prisma.activityLog.create({
      data: { userId, action: `ADMIN_CREDIT: ${currency} ${amount} | Ref: ${referenceNumber} | ${reason || ''}` },
    });

    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('transaction:new', transaction);
      io.to(`user:${userId}`).emit('balance:updated', { balance: account.balance + amount });
      io.to(`user:${userId}`).emit('notification:new', { title: 'Account Credited', message: `+${currency} ${amount.toFixed(2)}` });
    } catch {}

    return { message: 'User credited successfully', transaction, newBalance: account.balance + amount };
  }

  /* ================================================================
     BALANCE OPERATIONS — DEBIT
     ================================================================ */

  async debitUser(
    adminUserId: string,
    userId: string,
    amount: number,
    currency = 'USD',
    reason: string,
    description?: string
  ) {
    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) throw new Error('Account not found');
    if (amount <= 0) throw new Error('Amount must be positive');
    if (account.balance < amount) throw new Error('Insufficient user balance — cannot debit');
    if (account.status === 'FROZEN') throw new Error('Cannot debit a frozen account');

    const referenceNumber = generateReferenceNumber();

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          senderId: userId,
          receiverId: adminUserId,
          amount,
          currency,
          type: 'INTERNAL',
          status: 'COMPLETED',
          referenceNumber,
          description: description || `Admin debit — ${reason}`,
          reason,
        },
      }),
      prisma.account.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId,
        title: 'Account Debited',
        message: `Admin debited ${currency} ${amount.toFixed(2)} from your account. Reason: ${reason}`,
        type: 'TRANSACTION',
      },
    });

    await prisma.activityLog.create({
      data: { userId, action: `ADMIN_DEBIT: ${currency} ${amount} | Ref: ${referenceNumber} | Reason: ${reason}` },
    });

    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('transaction:new', transaction);
      io.to(`user:${userId}`).emit('balance:updated', { balance: account.balance - amount });
      io.to(`user:${userId}`).emit('notification:new', { title: 'Account Debited', message: `-${currency} ${amount.toFixed(2)}` });
    } catch {}

    return { message: 'User debited successfully', transaction, newBalance: account.balance - amount };
  }

  /* ================================================================
     BALANCE OPERATIONS — EDIT BALANCE
     ================================================================ */

  async editBalance(
    userId: string,
    balanceType: 'balance' | 'savingsBalance',
    value: number
  ) {
    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) throw new Error('Account not found');
    if (value < 0) throw new Error('Balance cannot be negative');

    const updated = await prisma.account.update({
      where: { userId },
      data: { [balanceType]: value },
    });

    await prisma.activityLog.create({
      data: { userId, action: `ADMIN_EDIT_${balanceType.toUpperCase()}: set to ${value}` },
    });

    return { message: `${balanceType} updated successfully`, [balanceType]: updated[balanceType] };
  }

  /* ================================================================
     FREEZE / UNFREEZE ACCOUNT
     ================================================================ */

  async freezeUser(userId: string) {
    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) throw new Error('Account not found');

    const newStatus = account.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';

    await prisma.account.update({
      where: { userId },
      data: { status: newStatus as any },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: newStatus === 'FROZEN' ? 'Account Frozen' : 'Account Unfrozen',
        message: `Your account has been ${newStatus.toLowerCase()} by admin`,
        type: 'SECURITY',
      },
    });

    await prisma.activityLog.create({
      data: { userId, action: newStatus === 'FROZEN' ? 'ACCOUNT_FROZEN' : 'ACCOUNT_UNFROZEN' },
    });

    return { message: `Account ${newStatus.toLowerCase()} successfully`, status: newStatus };
  }

  /* ================================================================
     REFUND MANAGEMENT
     ================================================================ */

  async getRefunds(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    const [refunds, total] = await Promise.all([
      prisma.refundRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          transaction: { select: { id: true, amount: true, currency: true, referenceNumber: true, timestamp: true } },
        },
      }),
      prisma.refundRequest.count({ where }),
    ]);

    return { refunds, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async processRefund(refundId: string, action: 'APPROVED' | 'REJECTED') {
    const refund = await prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: { transaction: true },
    });
    if (!refund) throw new Error('Refund request not found');
    if (refund.status !== 'PENDING') throw new Error(`Refund already ${refund.status.toLowerCase()}`);

    const updated = await prisma.refundRequest.update({
      where: { id: refundId },
      data: { status: action },
    });

    // If approved, reverse the original transaction
    if (action === 'APPROVED') {
      const tx = refund.transaction;
      await prisma.$transaction([
        prisma.account.update({ where: { userId: tx.senderId }, data: { balance: { increment: tx.amount } } }),
        prisma.account.update({ where: { userId: tx.receiverId }, data: { balance: { decrement: tx.amount } } }),
        prisma.transaction.update({
          where: { id: tx.id },
          data: { status: 'REVERSED', description: `${tx.description || ''} [REFUND APPROVED]` },
        }),
      ]);
    }

    await prisma.notification.create({
      data: {
        userId: refund.userId,
        title: `Refund ${action.toLowerCase()}`,
        message: `Your refund request #${refund.id.slice(-8)} for $${refund.amount.toFixed(2)} has been ${action.toLowerCase()}.`,
        type: 'SYSTEM',
      },
    });

    await prisma.activityLog.create({
      data: { userId: refund.userId, action: `REFUND_${action}: ${refund.id} | $${refund.amount}` },
    });

    try {
      const io = getIO();
      io.to(`user:${refund.userId}`).emit('notification:new', {
        title: `Refund ${action.toLowerCase()}`,
        message: `Your refund has been ${action.toLowerCase()}`,
      });
    } catch {}

    return { message: `Refund ${action.toLowerCase()} successfully`, refund: updated };
  }

  /* ================================================================
     ANALYTICS
     ================================================================ */

  async getAnalytics() {
    const [totalUsers, totalTransactions, pendingTransactions, totalVolume, activeCards, totalRefunds, pendingRefunds] =
      await Promise.all([
        prisma.user.count(),
        prisma.transaction.count({ where: { status: 'COMPLETED' } }),
        prisma.transaction.count({ where: { status: 'PENDING' } }),
        prisma.transaction.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.virtualCard.count({ where: { status: 'ACTIVE' } }),
        prisma.refundRequest.count(),
        prisma.refundRequest.count({ where: { status: 'PENDING' } }),
      ]);

    return {
      totalUsers,
      totalTransactions,
      pendingTransactions,
      totalVolume: totalVolume._sum.amount || 0,
      activeCards,
      totalRefunds,
      pendingRefunds,
    };
  }

  /* ================================================================
     ACTIVITY & AUDIT LOGS
     ================================================================ */

  async getActivityLogs(page = 1, limit = 50, userId?: string) {
    const skip = (page - 1) * limit;
    const where = userId ? { userId } : {};

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /* ================================================================
     ANNOUNCEMENTS
     ================================================================ */

  async getAnnouncements() {
    return prisma.announcement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAnnouncement(title: string, content: string, priority = 'NORMAL', createdBy: string) {
    return prisma.announcement.create({
      data: { title, content, priority, createdBy },
    });
  }

  async deleteAnnouncement(id: string) {
    await prisma.announcement.delete({ where: { id } });
    return { message: 'Announcement deleted' };
  }

  async toggleAnnouncement(id: string) {
    const a = await prisma.announcement.findUnique({ where: { id } });
    if (!a) throw new Error('Announcement not found');
    return prisma.announcement.update({
      where: { id },
      data: { active: !a.active },
    });
  }
}

export const adminService = new AdminService();
