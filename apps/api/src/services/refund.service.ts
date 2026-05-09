import prisma from '@srb/database';
import { getIO } from '../socket';

export class RefundService {
  async submitRefund(userId: string, transactionId: string, reason: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) throw new Error('Transaction not found');
    if (transaction.receiverId !== userId) throw new Error('You can only request refunds for received transactions');
    if (transaction.status !== 'COMPLETED') throw new Error('Only completed transactions can be refunded');

    // Check for existing refund
    const existing = await prisma.refundRequest.findUnique({ where: { transactionId } });
    if (existing) throw new Error('A refund request already exists for this transaction');

    const refund = await prisma.refundRequest.create({
      data: {
        transactionId,
        userId,
        amount: transaction.amount,
        reason,
        status: 'PENDING',
      },
    });

    // Notify
    await prisma.notification.create({
      data: {
        userId,
        title: 'Refund Submitted',
        message: `Your refund request for $${transaction.amount.toFixed(2)} has been submitted and is pending review.`,
        type: 'SYSTEM',
      },
    });

    await prisma.activityLog.create({
      data: { userId, action: `REFUND_SUBMITTED: ${refund.id} | $${transaction.amount}` },
    });

    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('notification:new', {
        title: 'Refund Submitted',
        message: `Refund request pending review`,
      });
    } catch {}

    return refund;
  }

  async getUserRefunds(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [refunds, total] = await Promise.all([
      prisma.refundRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          transaction: {
            select: {
              id: true, amount: true, currency: true,
              referenceNumber: true, timestamp: true, description: true,
              sender: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
      }),
      prisma.refundRequest.count({ where: { userId } }),
    ]);

    return { refunds, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getRefundById(refundId: string, userId: string) {
    const refund = await prisma.refundRequest.findUnique({
      where: { id: refundId },
      include: {
        transaction: {
          include: {
            sender: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });
    if (!refund || refund.userId !== userId) throw new Error('Refund request not found');
    return refund;
  }

  async getPublicAnnouncements() {
    return prisma.announcement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, content: true, priority: true, createdAt: true },
    });
  }
}

export const refundService = new RefundService();
