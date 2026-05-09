import Stripe from 'stripe';
import { env } from '../config/env';
import { prisma } from '@srb/database';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20' as any,
});

export const stripeService = {
  /**
   * Create or retrieve a Stripe customer for a user.
   */
  async createCustomer(userId: string, userEmail: string, userName: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if (user.stripeCustomerId) return user.stripeCustomerId;

    const customer = await stripe.customers.create({
      email: userEmail,
      name: userName,
      metadata: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  },

  /**
   * Create a PaymentIntent for card-based deposits.
   */
  async createPaymentIntent(userId: string, amount: number, currency: string = 'usd') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const customerId = await this.createCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency,
      customer: customerId,
      metadata: { userId, type: 'deposit' },
      description: `Deposit to SecureRefund wallet`,
    });

    await prisma.webhookEvent.create({
      data: {
        provider: 'STRIPE',
        eventType: 'payment_intent.created',
        eventId: paymentIntent.id,
        payload: JSON.stringify(paymentIntent),
        status: 'RECEIVED',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: currency.toUpperCase(),
    };
  },

  /**
   * Create a payout/transfer for withdrawals to connected bank accounts.
   */
  async createWithdrawal(userId: string, amount: number, currency: string = 'usd', bankAccountId?: string) {
    // Note: In production, you'd use Stripe Connect or ACH payouts.
    // This is a simplified version using PaymentIntents for refund flow.
    const referenceNumber = `WD-${Date.now()}-${userId.slice(0, 8)}`;

    await prisma.webhookEvent.create({
      data: {
        provider: 'STRIPE',
        eventType: 'withdrawal.requested',
        eventId: referenceNumber,
        payload: JSON.stringify({ userId, amount, currency, bankAccountId }),
        status: 'PROCESSING',
      },
    });

    return {
      referenceNumber,
      amount,
      currency: currency.toUpperCase(),
      status: 'PROCESSING',
    };
  },

  /**
   * Create an ACH debit from a linked bank account.
   */
  async createACHDeposit(userId: string, amount: number, bankAccountId: string, currency: string = 'usd') {
    // ACH via Stripe requires Plaid-verified bank accounts
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });
    if (!bankAccount) throw new Error('Bank account not found');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      payment_method_types: ['us_bank_account'],
      metadata: { userId, bankAccountId, type: 'ach_deposit' },
      description: `ACH deposit from ${bankAccount.maskedAccountNumber}`,
    });

    await prisma.webhookEvent.create({
      data: {
        provider: 'STRIPE',
        eventType: 'payment_intent.created',
        eventId: paymentIntent.id,
        payload: JSON.stringify(paymentIntent),
        status: 'RECEIVED',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: currency.toUpperCase(),
    };
  },

  /**
   * Fund a virtual card via Stripe.
   */
  async createCardFunding(userId: string, amount: number, cardId: string, currency: string = 'usd') {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId, cardId, type: 'card_funding' },
      description: `Virtual card funding`,
    });

    await prisma.webhookEvent.create({
      data: {
        provider: 'STRIPE',
        eventType: 'payment_intent.created',
        eventId: paymentIntent.id,
        payload: JSON.stringify(paymentIntent),
        status: 'RECEIVED',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: currency.toUpperCase(),
    };
  },

  /**
   * Handle Stripe webhook events.
   */
  async handleWebhook(payload: string, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Check for duplicate events (idempotency)
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    });
    if (existing) return; // Already processed

    // Store the webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: 'STRIPE',
        eventType: event.type,
        eventId: event.id,
        payload: JSON.stringify(event),
        status: 'RECEIVED',
      },
    });

    // Handle specific events
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, type } = paymentIntent.metadata;

        if (userId && type === 'deposit') {
          // Credit user's wallet
          const wallet = await prisma.wallet.findFirst({
            where: { userId, currency: paymentIntent.currency.toUpperCase() },
          });

          if (wallet) {
            await prisma.wallet.update({
              where: { id: wallet.id },
              data: { balance: { increment: paymentIntent.amount / 100 } },
            });
          }

          // Create transaction record
          await prisma.transaction.create({
            data: {
              senderId: userId,
              receiverId: userId,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              type: 'DEPOSIT',
              status: 'COMPLETED',
              referenceNumber: `DEP-${paymentIntent.id}`,
              providerReferenceId: paymentIntent.id,
              description: 'Wallet deposit via Stripe',
            },
          });
        }

        if (userId && type === 'card_funding') {
          const { cardId } = paymentIntent.metadata;
          if (cardId) {
            await prisma.virtualCard.update({
              where: { id: cardId },
              data: { balance: { increment: paymentIntent.amount / 100 } },
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`Payment failed for intent ${paymentIntent.id}: ${paymentIntent.last_payment_error?.message}`);
        break;
      }

      default:
        // Other events logged but not processed
        break;
    }

    // Mark webhook as processed
    await prisma.webhookEvent.update({
      where: { eventId: event.id },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });
  },
};
