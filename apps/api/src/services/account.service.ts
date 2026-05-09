import prisma from '@srb/database';

export class AccountService {
  async getAccount(userId: string) {
    const account = await prisma.account.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!account) throw new Error('Account not found');
    return account;
  }

  async getDashboard(userId: string) {
    const account = await prisma.account.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!account) throw new Error('Account not found');

    const recentTransactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        sender: { select: { firstName: true, lastName: true, email: true } },
        receiver: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    const cards = await prisma.virtualCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const totalSent = await prisma.transaction.aggregate({
      where: { senderId: userId, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const totalReceived = await prisma.transaction.aggregate({
      where: { receiverId: userId, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    return {
      account,
      recentTransactions,
      cards,
      notifications,
      totalSent: totalSent._sum.amount || 0,
      totalReceived: totalReceived._sum.amount || 0,
    };
  }
}

export const accountService = new AccountService();
