import { prisma } from '@srb/database';

export const disputeService = {
  /**
   * Create a new dispute for a transaction.
   */
  async createDispute(userId: string, transactionId: string, reason: string, description?: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) throw new Error('Transaction not found');
    if (transaction.senderId !== userId && transaction.receiverId !== userId) {
      throw new Error('You are not a party to this transaction');
    }

    const existing = await prisma.dispute.findFirst({
      where: { transactionId, userId },
    });
    if (existing) throw new Error('A dispute already exists for this transaction');

    const dispute = await prisma.dispute.create({
      data: {
        transactionId,
        userId,
        reason,
        description,
        status: 'OPEN',
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DISPUTE_CREATED',
        metadata: JSON.stringify({ transactionId, reason }),
      },
    });

    return dispute;
  },

  /**
   * Get all disputes (admin) with optional status filter.
   */
  async getDisputes(page: number = 1, limit: number = 20, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: {
          transaction: { select: { id: true, amount: true, currency: true, referenceNumber: true, type: true } },
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dispute.count({ where }),
    ]);

    return { disputes, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  /**
   * Get a single dispute by ID.
   */
  async getDisputeById(disputeId: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        transaction: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    if (!dispute) throw new Error('Dispute not found');
    return dispute;
  },

  /**
   * Admin: Resolve a dispute.
   */
  async resolveDispute(disputeId: string, adminId: string, resolution: string, resolvedFor: 'USER' | 'PLATFORM') {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { transaction: true },
    });

    if (!dispute) throw new Error('Dispute not found');
    if (dispute.status === 'CLOSED' || dispute.status === 'RESOLVED_USER' || dispute.status === 'RESOLVED_PLATFORM') {
      throw new Error('Dispute is already resolved');
    }

    const newStatus = resolvedFor === 'USER' ? 'RESOLVED_USER' : 'RESOLVED_PLATFORM';

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: newStatus as any,
        resolution,
        adminNotes: resolution,
        resolvedAt: new Date(),
        resolvedBy: adminId,
      },
    });

    // If resolved for user, reverse the transaction
    if (resolvedFor === 'USER') {
      await prisma.transaction.update({
        where: { id: dispute.transactionId },
        data: { status: 'REVERSED' },
      });

      // Refund the amount to the user's wallet
      const wallet = await prisma.wallet.findFirst({
        where: { userId: dispute.userId, isDefault: true },
      });
      if (wallet) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: dispute.transaction.amount } },
        });
      }
    }

    await prisma.activityLog.create({
      data: {
        userId: dispute.userId,
        action: 'DISPUTE_RESOLVED',
        metadata: JSON.stringify({ disputeId, resolvedFor, resolution, adminId }),
      },
    });

    return updated;
  },

  /**
   * Admin: Request additional evidence from user.
   */
  async requestEvidence(disputeId: string, adminId: string, notes: string) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new Error('Dispute not found');

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'EVIDENCE_REQUESTED',
        adminNotes: notes,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: dispute.userId,
        action: 'DISPUTE_EVIDENCE_REQUESTED',
        metadata: JSON.stringify({ disputeId, notes, adminId }),
      },
    });

    return updated;
  },

  /**
   * Submit evidence for a dispute.
   */
  async submitEvidence(disputeId: string, userId: string, evidenceUrl: string) {
    const dispute = await prisma.dispute.findFirst({
      where: { id: disputeId, userId },
    });

    if (!dispute) throw new Error('Dispute not found');
    if (dispute.status !== 'EVIDENCE_REQUESTED' && dispute.status !== 'OPEN') {
      throw new Error('Cannot submit evidence at this stage');
    }

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        evidenceUrl,
        status: 'UNDER_REVIEW',
      },
    });

    return updated;
  },
};
