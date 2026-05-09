import prisma from '@srb/database';
import { generateCardNumber, generateCvv, generateExpiryDate } from '../utils/helpers';
import type { CardCreateRequest } from '@srb/shared';

export class CardService {
  async createCard(userId: string, data: CardCreateRequest) {
    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) throw new Error('Account not found');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const card = await prisma.virtualCard.create({
      data: {
        accountId: account.id,
        userId,
        cardType: data.cardType,
        cardNumber: generateCardNumber(data.cardType),
        cvv: generateCvv(),
        expiryDate: generateExpiryDate(),
        cardholderName: `${user.firstName} ${user.lastName}`,
        status: 'ACTIVE',
        spendingLimit: data.spendingLimit || 10000.00,
        colorTheme: data.colorTheme || 'blue',
        balance: data.initialBalance || 0.00,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'Virtual Card Created',
        message: `Your new ${data.cardType} card ending in ${card.cardNumber.slice(-4)} has been issued`,
        type: 'CARD',
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CARD_CREATED',
        ipAddress: 'System',
        userAgent: 'Card Service',
      },
    });

    return card;
  }

  async getCards(userId: string) {
    return prisma.virtualCard.findMany({
      where: { userId, status: { not: 'CANCELLED' } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCard(cardId: string) {
    const card = await prisma.virtualCard.findUnique({ where: { id: cardId } });
    if (!card) throw new Error('Card not found');
    return card;
  }

  async freezeCard(cardId: string) {
    const card = await prisma.virtualCard.findUnique({ where: { id: cardId } });
    if (!card) throw new Error('Card not found');

    const newStatus = card.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
    const updated = await prisma.virtualCard.update({
      where: { id: cardId },
      data: { status: newStatus as any },
    });

    await prisma.notification.create({
      data: {
        userId: card.userId,
        title: newStatus === 'FROZEN' ? 'Card Frozen' : 'Card Unfrozen',
        message: `Your ${card.cardType} card ending in ${card.cardNumber.slice(-4)} has been ${newStatus.toLowerCase()}`,
        type: 'CARD',
      },
    });

    return updated;
  }

  async updateLimit(cardId: string, limit: number) {
    const card = await prisma.virtualCard.update({
      where: { id: cardId },
      data: { spendingLimit: limit },
    });
    return card;
  }

  async renameCard(cardId: string, label: string) {
    const card = await prisma.virtualCard.update({
      where: { id: cardId },
      data: { cardLabel: label },
    });
    return card;
  }

  async updateColorTheme(cardId: string, colorTheme: string) {
    const validThemes = ['blue', 'purple', 'gold', 'black', 'red'];
    if (!validThemes.includes(colorTheme)) {
      throw new Error(`Invalid color theme. Must be one of: ${validThemes.join(', ')}`);
    }
    const card = await prisma.virtualCard.update({
      where: { id: cardId },
      data: { colorTheme },
    });
    return card;
  }

  async cancelCard(cardId: string) {
    const card = await prisma.virtualCard.update({
      where: { id: cardId },
      data: { status: 'CANCELLED' },
    });

    await prisma.notification.create({
      data: {
        userId: card.userId,
        title: 'Card Cancelled',
        message: `Your ${card.cardType} card ending in ${card.cardNumber.slice(-4)} has been cancelled`,
        type: 'CARD',
      },
    });

    return card;
  }

  /* ---------- Admin Operations ---------- */

  async getAllCards(page = 1, limit = 20, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [cards, total] = await Promise.all([
      prisma.virtualCard.findMany({
        where,
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.virtualCard.count({ where }),
    ]);

    return { cards, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async adminFreezeCard(cardId: string) {
    const card = await prisma.virtualCard.findUnique({ where: { id: cardId } });
    if (!card) throw new Error('Card not found');

    const newStatus = card.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
    const updated = await prisma.virtualCard.update({
      where: { id: cardId },
      data: { status: newStatus as any },
    });

    await prisma.notification.create({
      data: {
        userId: card.userId,
        title: newStatus === 'FROZEN' ? 'Card Frozen by Admin' : 'Card Unfrozen by Admin',
        message: `Your ${card.cardType} card has been ${newStatus.toLowerCase()} by an administrator`,
        type: 'CARD',
      },
    });

    return updated;
  }

  async adminDeleteCard(cardId: string) {
    const card = await prisma.virtualCard.findUnique({ where: { id: cardId } });
    if (!card) throw new Error('Card not found');

    await prisma.notification.create({
      data: {
        userId: card.userId,
        title: 'Card Deleted by Admin',
        message: `Your ${card.cardType} card has been deleted by an administrator`,
        type: 'CARD',
      },
    });

    await prisma.virtualCard.delete({ where: { id: cardId } });
    return { message: 'Card permanently deleted' };
  }

  async adminEditCardBalance(cardId: string, balance: number) {
    if (balance < 0) throw new Error('Balance cannot be negative');
    const card = await prisma.virtualCard.update({
      where: { id: cardId },
      data: { balance },
    });
    return card;
  }

  async getCardAnalytics(cardId: string) {
    const card = await prisma.virtualCard.findUnique({ where: { id: cardId } });
    if (!card) throw new Error('Card not found');

    // Get total spending (simulated from transactions since cards don't have direct transactions)
    const totalSpending = await prisma.transaction.aggregate({
      where: { senderId: card.userId },
      _sum: { amount: true },
    });

    return {
      card,
      totalSpent: totalSpending._sum.amount || 0,
      spendingLimit: card.spendingLimit,
      remainingLimit: card.spendingLimit - (totalSpending._sum.amount || 0),
      usagePercent: card.spendingLimit > 0 ? ((totalSpending._sum.amount || 0) / card.spendingLimit) * 100 : 0,
    };
  }
}

export const cardService = new CardService();
