import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { env } from '../config/env';
import { prisma } from '@srb/database';
import { encrypt } from '../utils/encryption';

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': env.PLAID_CLIENT_ID,
      'PLAID-SECRET': env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

export const plaidService = {
  /**
   * Generate a Link token for the Plaid Link frontend widget.
   */
  async createLinkToken(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'SecureRefund',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us, CountryCode.Gb],
      language: 'en',
      webhook: `${env.CORS_ORIGIN}/api/webhooks/plaid`,
    });

    return response.data.link_token;
  },

  /**
   * Exchange a public token from Plaid Link for an access token.
   */
  async exchangePublicToken(publicToken: string, userId: string, institutionId: string, institutionName: string) {
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Fetch account details from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const savedAccounts: any[] = [];

    for (const account of accountsResponse.data.accounts) {
      // Check if account already linked
      const existing = await prisma.bankAccount.findFirst({
        where: {
          userId,
          plaidItemId: itemId,
          maskedAccountNumber: account.mask || '****',
        },
      });

      if (existing) continue;

      const encryptedAccountNumber = encrypt(account.mask || '****');
      const encryptedRouting = encrypt(''); // Routing numbers not returned by Plaid auth

      const bankAccount = await prisma.bankAccount.create({
        data: {
          userId,
          institutionName,
          institutionId,
          maskedAccountNumber: account.mask || '****',
          accountNumber: encryptedAccountNumber,
          routingNumber: encryptedRouting,
          accountType: account.subtype || 'checking',
          plaidAccessToken: encrypt(accessToken),
          plaidItemId: itemId,
          isVerified: true,
          isPrimary: savedAccounts.length === 0 && accountsResponse.data.accounts.length === 1,
        },
      });

      savedAccounts.push(bankAccount);
    }

    return {
      itemId,
      accounts: savedAccounts.map((a) => ({
        id: a.id,
        institutionName: a.institutionName,
        maskedAccountNumber: a.maskedAccountNumber,
        accountType: a.accountType,
        isVerified: a.isVerified,
      })),
    };
  },

  /**
   * Get linked accounts for a user.
   */
  async getAccounts(userId: string) {
    return prisma.bankAccount.findMany({
      where: { userId, status: 'ACTIVE' },
      select: {
        id: true,
        institutionName: true,
        institutionId: true,
        maskedAccountNumber: true,
        accountType: true,
        isVerified: true,
        isPrimary: true,
        linkedAt: true,
      },
      orderBy: { linkedAt: 'desc' },
    });
  },

  /**
   * Get real-time balances from Plaid.
   */
  async getBalance(accessToken: string) {
    const response = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    });

    return response.data.accounts.map((account: any) => ({
      accountId: account.account_id,
      name: account.name,
      mask: account.mask,
      type: account.subtype,
      currentBalance: account.balances.current,
      availableBalance: account.balances.available,
      currency: account.balances.iso_currency_code || 'USD',
    }));
  },

  /**
   * Get transactions from Plaid for a linked account.
   */
  async getTransactions(accessToken: string, startDate: string, endDate: string) {
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: { count: 50 },
    });

    return response.data.transactions.map((tx: any) => ({
      transactionId: tx.transaction_id,
      amount: tx.amount,
      date: tx.date,
      name: tx.name,
      merchantName: tx.merchant_name,
      category: tx.category,
      pending: tx.pending,
    }));
  },

  /**
   * Unlink a bank account.
   */
  async unlinkAccount(bankAccountId: string, userId: string) {
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
    });

    if (!bankAccount) throw new Error('Bank account not found');

    await prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: { status: 'REMOVED' },
    });

    return { message: 'Bank account unlinked successfully' };
  },

  /**
   * Handle Plaid webhook events.
   */
  async handleWebhook(payload: any): Promise<void> {
    const webhookType = payload.webhook_type;
    const webhookCode = payload.webhook_code;
    const itemId = payload.item_id;

    // Check for duplicate events
    const eventId = `${itemId}-${webhookCode}-${payload.timestamp || Date.now()}`;
    const existing = await prisma.webhookEvent.findFirst({
      where: { provider: 'PLAID', eventType: `${webhookType}.${webhookCode}` },
    });

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: 'PLAID',
        eventType: `${webhookType}.${webhookCode}`,
        eventId,
        payload: JSON.stringify(payload),
        status: 'RECEIVED',
      },
    });

    switch (webhookCode) {
      case 'TRANSACTIONS_REMOVED':
      case 'DEFAULT_UPDATE':
      case 'INITIAL_UPDATE':
      case 'TRANSACTIONS_UPDATE':
        // Transaction updates — could trigger balance reconciliation
        break;

      case 'ERROR':
      case 'ITEM_LOGIN_REQUIRED':
        // Mark bank account as needing re-authentication
        await prisma.bankAccount.updateMany({
          where: { plaidItemId: itemId },
          data: { status: 'REAUTH_REQUIRED' },
        });
        break;

      case 'PENDING_EXPIRATION':
        // Item access expiring — notify user to re-link
        break;

      default:
        break;
    }

    if (!existing) {
      await prisma.webhookEvent.updateMany({
        where: { provider: 'PLAID', eventType: `${webhookType}.${webhookCode}` },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });
    }
  },
};
