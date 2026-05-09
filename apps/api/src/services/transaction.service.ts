import prisma from '@srb/database';
import { generateReferenceNumber } from '../utils/helpers';
import type { TransferRequest } from '@srb/shared';
import { getIO } from '../socket';

export class TransactionService {
  async transfer(senderId: string, data: TransferRequest) {
    const receiver = await prisma.user.findUnique({
      where: { email: data.receiverEmail },
      include: { account: true },
    });
    if (!receiver) throw new Error('Recipient not found');
    if (!receiver.account) throw new Error('Recipient has no active account');

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      include: { account: true },
    });
    if (!sender?.account) throw new Error('Account not found');
    if (sender.account.status === 'FROZEN') throw new Error('Your account is frozen');
    if (sender.account.balance < data.amount) throw new Error('Insufficient funds');

    const referenceNumber = generateReferenceNumber();

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          senderId,
          receiverId: receiver.id,
          amount: data.amount,
          currency: data.currency || 'USD',
          type: data.type,
          status: 'COMPLETED',
          referenceNumber,
          description: data.description || null,
        },
      }),
      prisma.account.update({
        where: { userId: senderId },
        data: { balance: { decrement: data.amount } },
      }),
      prisma.account.update({
        where: { userId: receiver.id },
        data: { balance: { increment: data.amount } },
      }),
    ]);

    // Notifications
    await prisma.notification.create({
      data: {
        userId: senderId,
        title: 'Transfer Sent',
        message: `$${data.amount.toFixed(2)} sent to ${receiver.firstName} ${receiver.lastName}`,
        type: 'TRANSACTION',
      },
    });

    await prisma.notification.create({
      data: {
        userId: receiver.id,
        title: 'Transfer Received',
        message: `$${data.amount.toFixed(2)} received from ${sender.firstName} ${sender.lastName}`,
        type: 'TRANSACTION',
      },
    });

    // Socket.io notifications
    try {
      const io = getIO();
      io.to(`user:${senderId}`).emit('transaction:new', transaction);
      io.to(`user:${receiver.id}`).emit('transaction:new', transaction);
      io.to(`user:${senderId}`).emit('balance:updated', { balance: sender.account.balance - data.amount });
      io.to(`user:${receiver.id}`).emit('balance:updated', { balance: receiver.account.balance + data.amount });
    } catch {}

    return transaction;
  }

  async deposit(userId: string, amount: number) {
    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) throw new Error('Account not found');

    await prisma.account.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'Deposit Received',
        message: `$${amount.toFixed(2)} has been deposited to your account`,
        type: 'TRANSACTION',
      },
    });

    return { message: 'Deposit successful', newBalance: account.balance + amount };
  }

  async withdraw(userId: string, amount: number) {
    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) throw new Error('Account not found');
    if (account.status === 'FROZEN') throw new Error('Account is frozen');
    if (account.balance < amount) throw new Error('Insufficient funds');

    await prisma.account.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'Withdrawal',
        message: `$${amount.toFixed(2)} has been withdrawn from your account`,
        type: 'TRANSACTION',
      },
    });

    return { message: 'Withdrawal successful', newBalance: account.balance - amount };
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          sender: { select: { firstName: true, lastName: true, email: true } },
          receiver: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.transaction.count({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
      }),
    ]);

    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getTransactionById(id: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id },
      include: {
        sender: { select: { firstName: true, lastName: true, email: true } },
        receiver: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!tx) throw new Error('Transaction not found');
    return tx;
  }
}

export const transactionService = new TransactionService();
