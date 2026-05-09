import { env } from '../config/env';
import { prisma } from '@srb/database';

const WISE_API_BASE = env.WISE_ENV === 'live'
  ? 'https://api.wise.com'
  : 'https://api.sandbox.transferwise.tech';

interface WiseApiResponse {
  data?: any;
  error?: string;
}

async function wiseRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<WiseApiResponse> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${env.WISE_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${WISE_API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    return { error: data.message || `Wise API error: ${response.status}` };
  }

  return { data };
}

export const wiseService = {
  /**
   * Create a quote for an international transfer.
   */
  async createQuote(sourceCurrency: string, targetCurrency: string, amount: number) {
    const result = await wiseRequest('/v3/profiles/' + env.WISE_PROFILE_ID + '/quotes', 'POST', {
      sourceCurrency,
      targetCurrency,
      sourceAmount: Math.round(amount * 100) / 100,
      payOut: 'BANK_TRANSFER',
    });

    if (result.error) throw new Error(result.error);

    const quote = result.data;
    return {
      quoteId: quote.id,
      sourceCurrency: quote.sourceCurrency,
      targetCurrency: quote.targetCurrency,
      sourceAmount: quote.sourceAmount,
      targetAmount: quote.targetAmount,
      rate: quote.rate,
      fee: quote.fee,
      expirationTime: quote.expirationTime,
    };
  },

  /**
   * Execute a transfer using a quote.
   */
  async createTransfer(
    userId: string,
    quoteId: string,
    recipientId: string,
    amount: number,
    reference?: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const result = await wiseRequest('/v1/transfers', 'POST', {
      targetAccount: recipientId,
      quoteUuid: quoteId,
      customerTransactionId: `SRB-${Date.now()}-${userId.slice(0, 8)}`,
      details: {
        reference: reference || 'SecureRefund transfer',
        sourceOfFunds: 'salary',
      },
    });

    if (result.error) throw new Error(result.error);

    const transfer = result.data;

    // Create transaction record
    await prisma.transaction.create({
      data: {
        senderId: userId,
        receiverId: userId, // Self-referencing for international outgoing
        amount,
        currency: transfer.sourceCurrency || 'USD',
        type: 'WIRE',
        status: 'PENDING',
        referenceNumber: `WISE-${transfer.id}`,
        providerReferenceId: transfer.id,
        description: `Wise international transfer: ${reference || ''}`,
        feeAmount: transfer.fee || 0,
      },
    });

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: 'WISE',
        eventType: 'transfer.created',
        eventId: transfer.id,
        payload: JSON.stringify(transfer),
        status: 'PROCESSING',
      },
    });

    return {
      transferId: transfer.id,
      status: transfer.status,
      amount,
      sourceCurrency: transfer.sourceCurrency,
      targetCurrency: transfer.targetCurrency,
      estimatedDelivery: transfer.estimatedDeliveryTime,
    };
  },

  /**
   * Get transfer status.
   */
  async getTransferStatus(transferId: string) {
    const result = await wiseRequest(`/v1/transfers/${transferId}`, 'GET');

    if (result.error) throw new Error(result.error);

    const transfer = result.data;
    return {
      transferId: transfer.id,
      status: transfer.status,
      sourceAmount: transfer.sourceAmount,
      targetAmount: transfer.targetAmount,
      sourceCurrency: transfer.sourceCurrency,
      targetCurrency: transfer.targetCurrency,
      rate: transfer.rate,
      fee: transfer.fee,
      created: transfer.created,
      completed: transfer.completedAt,
    };
  },

  /**
   * Handle Wise webhook events.
   */
  async handleWebhook(payload: any): Promise<void> {
    const eventType = payload.event_type || 'unknown';
    const transferId = payload.data?.resource?.id;
    const eventId = payload.data?.resource?.id + '-' + Date.now();

    // Check for duplicate events
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });
    if (existing) return;

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: 'WISE',
        eventType,
        eventId,
        payload: JSON.stringify(payload),
        status: 'RECEIVED',
      },
    });

    // Handle transfer status updates
    if (transferId && (eventType === 'transfer.outgoing_payment_sent' || eventType === 'transfers#state-change')) {
      const status = payload.data?.current_state || payload.data?.status;

      if (status) {
        // Update transaction status
        await prisma.transaction.updateMany({
          where: { providerReferenceId: transferId },
          data: {
            status: status === 'outgoing_payment_sent' ? 'COMPLETED' : 'PENDING',
          },
        });
      }
    }

    // Mark as processed
    await prisma.webhookEvent.update({
      where: { eventId },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });
  },
};
