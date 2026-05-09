import { prisma } from '@srb/database';
import { env } from '../config/env';

export const complianceService = {
  /**
   * Assess risk for a user based on profile and transaction patterns.
   */
  async assessRisk(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentTransactions: { orderBy: { timestamp: 'desc' }, take: 100 },
        receivedTransactions: { orderBy: { timestamp: 'desc' }, take: 100 },
      },
    });

    if (!user) throw new Error('User not found');

    const riskFactors: string[] = [];
    let riskScore = 0;

    // KYC status risk
    if (user.kycStatus === 'NOT_SUBMITTED') {
      riskScore += 30;
      riskFactors.push('KYC not submitted');
    }

    // Country risk
    const sanctionedCountries = ['IR', 'KP', 'SY', 'CU', 'VE'];
    if (sanctionedCountries.includes(user.country)) {
      riskScore += 60;
      riskFactors.push('Sanctioned country');
    }

    // Transaction volume risk
    const allTx = [...user.sentTransactions, ...user.receivedTransactions];
    const totalVolume = allTx.reduce((s: number, tx: any) => s + tx.amount, 0);

    if (totalVolume > env.AML_THRESHOLD) {
      riskScore += 25;
      riskFactors.push('High transaction volume');
    }

    // Rapid transactions
    const last24h = allTx.filter((tx: any) => {
      const txTime = new Date(tx.timestamp).getTime();
      return Date.now() - txTime < 24 * 60 * 60 * 1000;
    });

    if (last24h.length > 10) {
      riskScore += 15;
      riskFactors.push('High transaction frequency');
    }

    let riskLevel: string;
    if (riskScore >= 70) riskLevel = 'CRITICAL';
    else if (riskScore >= 40) riskLevel = 'HIGH';
    else if (riskScore >= 20) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    await prisma.user.update({
      where: { id: userId },
      data: {
        riskScore,
        amlChecked: true,
        amlCheckedAt: new Date(),
      },
    });

    await prisma.complianceLog.create({
      data: {
        userId,
        action: 'RISK_ASSESSMENT',
        riskLevel: riskLevel as any,
        riskScore,
        details: JSON.stringify({ factors: riskFactors, totalVolume, txCount24h: last24h.length }),
        triggeredBy: 'SYSTEM',
      },
    });

    return { userId, riskScore, riskLevel, factors: riskFactors, assessedAt: new Date().toISOString() };
  },

  /**
   * Check a transaction against AML rules.
   */
  async checkAml(transaction: any) {
    const amount = transaction.amount || 0;
    let riskLevel: string = 'LOW';
    let riskScore = 0;
    const flags: string[] = [];

    if (amount >= env.AML_THRESHOLD) {
      riskScore += 40;
      riskLevel = 'HIGH';
      flags.push(`Amount exceeds AML threshold of $${env.AML_THRESHOLD}`);

      // Auto-flag for admin review
      await this.flagSuspiciousActivity(transaction.senderId, transaction.id, flags[0]);
    }

    // Check sender's recent volume
    if (transaction.senderId) {
      const recentTx = await prisma.transaction.findMany({
        where: {
          senderId: transaction.senderId,
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      const dailyVolume = recentTx.reduce((s: number, tx: any) => s + tx.amount, 0);
      if (dailyVolume > env.AML_THRESHOLD * 3) {
        riskScore += 30;
        riskLevel = 'CRITICAL';
        flags.push('Excessive daily transaction volume');
      }
    }

    // Create compliance log
    await prisma.complianceLog.create({
      data: {
        userId: transaction.senderId,
        transactionId: transaction.id,
        action: 'AML_CHECK',
        riskLevel: riskLevel as any,
        riskScore,
        details: JSON.stringify({ amount, flags, checkedAt: new Date().toISOString() }),
        triggeredBy: 'SYSTEM',
      },
    });

    return { passed: riskLevel !== 'CRITICAL', riskLevel, flags };
  },

  /**
   * Flag suspicious activity for admin review.
   */
  async flagSuspiciousActivity(userId: string, transactionId: string, reason: string) {
    const log = await prisma.complianceLog.create({
      data: {
        userId,
        transactionId,
        action: 'SUSPICIOUS_FLAG',
        riskLevel: 'HIGH',
        riskScore: 70,
        details: JSON.stringify({ reason, flaggedAt: new Date().toISOString() }),
        triggeredBy: 'SYSTEM',
      },
    });

    // Notify: in production, send email/Slack to admin team
    console.warn(`[COMPLIANCE] Suspicious activity flagged: User ${userId}, TX ${transactionId}, Reason: ${reason}`);

    return log;
  },

  /**
   * Generate a Suspicious Activity Report (SAR) for a date range.
   */
  async generateSarReport(startDate: string, endDate: string) {
    const logs = await prisma.complianceLog.findMany({
      where: {
        action: 'SUSPICIOUS_FLAG',
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const byLevel = {
      LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0,
    };

    const allLogs = await prisma.complianceLog.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    allLogs.forEach((log: any) => {
      if (byLevel[log.riskLevel as keyof typeof byLevel] !== undefined) {
        byLevel[log.riskLevel as keyof typeof byLevel]++;
      }
    });

    return {
      reportPeriod: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      summary: {
        totalSuspiciousFlags: logs.length,
        totalComplianceChecks: allLogs.length,
        byRiskLevel: byLevel,
      },
      suspiciousActivities: logs.map((log: any) => ({
        id: log.id,
        userId: log.userId,
        transactionId: log.transactionId,
        riskLevel: log.riskLevel,
        riskScore: log.riskScore,
        details: log.details,
        createdAt: log.createdAt,
      })),
    };
  },

  /**
   * Get compliance dashboard for admin.
   */
  async getComplianceDashboard() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalFlags, pendingFlags, highRiskUsers, recentFlags] = await Promise.all([
      prisma.complianceLog.count({ where: { action: 'SUSPICIOUS_FLAG' } }),
      prisma.complianceLog.count({ where: { action: 'SUSPICIOUS_FLAG', isResolved: false } }),
      prisma.user.count({ where: { riskScore: { gte: 40 } } }),
      prisma.complianceLog.findMany({
        where: { createdAt: { gte: last24h }, action: 'SUSPICIOUS_FLAG' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const riskDistribution = await prisma.user.groupBy({
      by: ['riskScore'],
      _count: true,
    });

    return {
      summary: {
        totalFlags,
        pendingFlags,
        highRiskUsers,
        flagsLast24h: recentFlags.length,
      },
      recentFlags: recentFlags.map((f: any) => ({
        id: f.id,
        userId: f.userId,
        transactionId: f.transactionId,
        riskLevel: f.riskLevel,
        riskScore: f.riskScore,
        details: f.details,
        isResolved: f.isResolved,
        createdAt: f.createdAt,
      })),
      riskDistribution,
    };
  },
};
