import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { env } from '../config/env';

let io: SocketServer;

export function initializeSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = verifyAccessToken(token as string);
      (socket as any).userId = decoded.userId;
      (socket as any).email = decoded.email;
      (socket as any).role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    const role = (socket as any).role;
    console.log(`User connected: ${userId} (${role})`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Admin users join admin room
    if (role === 'ADMIN') {
      socket.join('admin:room');
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

// Emit helpers for use across services
export function emitToUser(userId: string, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToAdmins(event: string, data: any) {
  if (!io) return;
  io.to('admin:room').emit(event, data);
}

export function emitBalanceUpdate(userId: string, balance: any) {
  emitToUser(userId, 'balance:update', balance);
}

export function emitTransactionUpdate(userId: string, transaction: any) {
  emitToUser(userId, 'transaction:new', transaction);
  emitToAdmins('admin:transaction:new', transaction);
}

export function emitNotification(userId: string, notification: any) {
  emitToUser(userId, 'notification:new', notification);
}
