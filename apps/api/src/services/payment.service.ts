import { prisma } from '@srb/database';
import { stripeService } from './stripe.service';
import { wiseService } from './wise.service';
import { complianceService } from './compliance.service';
import { env } from '../config/env';

export const paymentService = {
  /**
   * Initiate a deposit via Stripe or Wise.
   */
  async initiateDeposit(
    userId: string,
    amount: number,
    method: string,
    currency: string = 'USD',
    bankAccountId?: string
  ) {
    if (amount <= 0) throw new Error('Amount must be positive');

    // AML check for large deposits
    if (amount >= env.AML_THRESHOLD) {
      await complianceService.checkAml({
        senderId: userId,
        id: 'pending',
        amount,
      });
    }

    if (method === 'CARD' || method === 'STRIPE') {
      return stripeService.createPaymentIntent(userId, amount, currency.toLowerCase());
    }

    if (method === 'ACH' && bankAccountId) {
      return stripeService.createACHDeposit(userId, amount, bankAccountId, currency.toLowerCase());
    }

    throw new Error(`Unsupported deposit method: ${method}`);
  },

  /**
   * Confirm a deposit after successful payment.
   */
  async confirmDeposit(userId: string, paymentIntentId: string) {
    // The actual crediting happens in the Stripe webhook handler.
    // This endpoint is for the frontend to call after Stripe confirms success.

    const wallet = await prisma.wallet.findFirst({
      where: { userId, currency: 'USD', isDefault: true },
    });

    if (!wallet) {
      // Create default wallet if not exists
      await prisma.wallet.create({
        data: {
          userId,
          currency: 'USD',
          balance: 0,
          isDefault: true,
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DEPOSIT_CONFIRMED',
        metadata: JSON.stringify({ paymentIntentId }),
      },
    });

    return {
      message: 'Deposit confirmed',
      paymentIntentId,
    };
  },

  /**
   * Request a withdrawal to a linked bank account.
   */
  async requestWithdrawal(
    userId: string,
    amount: number,
    currency: string = 'USD',
    bankAccountId: string
  ) {
    if (amount <= 0) throw new Error('Amount must be positive');

    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });
    if (!bankAccount) throw new Error('Bank account not found');
    if (bankAccount.status !== 'ACTIVE') throw new Error('Bank account is not active');

    // Check wallet balance
    const wallet = await prisma.wallet.findFirst({
      where: { userId, currency, isDefault: true },
    });
    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Debit wallet
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });

    // Create transaction record
    const referenceNumber = `WD-${Date.now()}-${userId.slice(0, 8)}`;
    const transaction = await prisma.transaction.create({
      data: {
        senderId: userId,
        receiverId: userId,
        amount,
        currency,
        type: 'WITHDRAWAL',
        status: 'PENDING',
        referenceNumber,
        bankAccountId,
        description: `Withdrawal to ${bankAccount.maskedAccountNumber}`,
      },
    });

    // Create fee record (1% withdrawal fee)
    const feeAmount = Math.round(amount * 0.01 * 100) / 100;
    if (feeAmount > 0) {
      await prisma.feeRecord.create({
        data: {
          transactionId: transaction.id,
          userId,
          feeType: 'WITHDRAWAL_FEE',
          amount: feeAmount,
          currency,
          description: `Withdrawal fee for ${referenceNumber}`,
        },
      });
    }

    // Initiate Stripe payout
    await stripeService.createWithdrawal(userId, amount, currency.toLowerCase(), bankAccountId);

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'WITHDRAWAL_REQUESTED',
        metadata: JSON.stringify({ amount, currency, bankAccountId, referenceNumber }),
      },
    });

    return {
      message: 'Withdrawal initiated',
      transactionId: transaction.id,
      referenceNumber,
      amount,
      fee: feeAmount,
      status: 'PENDING',
    };
  },

  /**
   * Get payment transaction history.
   */
  async getPaymentHistory(userId: string, page: number = 1, limit: number = 20) {
    const where = {
      senderId: userId,
      type: {
        in: ['DEPOSIT', 'WITHDRAWAL', 'ACH', 'CARD_FUNDING', 'STRIPE_PAYMENT', 'WIRE'],
      },
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: where as any,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where: where as any }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get user wallets.
   */
  async getWallets(userId: string) {
    let wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    // Create default USD wallet if none exist
    if (wallets.length === 0) {
      wallets = [
        await prisma.wallet.create({
          data: {
            userId,
            currency: 'USD',
            balance: 0,
            isDefault: true,
          },
        }),
      ];
    }

    return wallets;
  },
};
