import { prisma } from '@srb/database';
import { hashSensitive } from '../utils/encryption';

export const kycService = {
  /**
   * Submit KYC documents for a user.
   */
  async submitKyc(
    userId: string,
    files: Array<{ documentType: string; fileName: string; fileUrl: string; fileSize: number }>
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Only allow submission if not already approved
    if (user.kycStatus === 'APPROVED') {
      throw new Error('KYC already approved');
    }

    if (user.kycStatus === 'PENDING') {
      throw new Error('KYC already submitted and pending review');
    }

    // Create KYC document records
    const documents = [];
    for (const file of files) {
      const doc = await prisma.kycDocument.create({
        data: {
          userId,
          documentType: file.documentType as any,
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize,
          status: 'PENDING',
        },
      });
      documents.push(doc);
    }

    // Update user KYC status
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'PENDING',
        kycSubmittedAt: new Date(),
      },
    });

    // Create compliance log entry
    await prisma.complianceLog.create({
      data: {
        userId,
        action: 'KYC_SUBMITTED',
        riskLevel: 'LOW',
        riskScore: 0,
        details: JSON.stringify({ documentCount: files.length, types: files.map((f) => f.documentType) }),
        triggeredBy: userId,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'KYC_SUBMITTED',
        metadata: JSON.stringify({ documentCount: files.length }),
      },
    });

    return {
      message: 'KYC documents submitted successfully',
      status: 'PENDING',
      documents: documents.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        fileName: d.fileName,
        status: d.status,
        submittedAt: d.submittedAt,
      })),
    };
  },

  /**
   * Get KYC status and documents for a user.
   */
  async getKycStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        kycStatus: true,
        kycSubmittedAt: true,
        kycVerifiedAt: true,
        riskScore: true,
        amlChecked: true,
        amlCheckedAt: true,
      },
    });

    if (!user) throw new Error('User not found');

    const documents = await prisma.kycDocument.findMany({
      where: { userId },
      select: {
        id: true,
        documentType: true,
        fileName: true,
        fileSize: true,
        status: true,
        rejectionReason: true,
        reviewerNotes: true,
        submittedAt: true,
        reviewedAt: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    return {
      kycStatus: user.kycStatus,
      kycSubmittedAt: user.kycSubmittedAt,
      kycVerifiedAt: user.kycVerifiedAt,
      riskScore: user.riskScore,
      amlChecked: user.amlChecked,
      amlCheckedAt: user.amlCheckedAt,
      documents,
    };
  },

  /**
   * Resubmit KYC after rejection.
   */
  async resubmitKyc(
    userId: string,
    files: Array<{ documentType: string; fileName: string; fileUrl: string; fileSize: number }>
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if (user.kycStatus !== 'REJECTED' && user.kycStatus !== 'RESUBMISSION_REQUIRED') {
      throw new Error('KYC resubmission is only allowed after rejection');
    }

    // Mark old documents as replaced
    await prisma.kycDocument.updateMany({
      where: { userId, status: 'REJECTED' },
      data: { status: 'RESUBMISSION_REQUIRED' },
    });

    // Submit new documents
    return this.submitKyc(userId, files);
  },

  /**
   * Admin: Get all pending KYC reviews.
   */
  async getPendingReviews() {
    const documents = await prisma.kycDocument.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            country: true,
            kycStatus: true,
            kycSubmittedAt: true,
            riskScore: true,
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    // Group by user
    const userMap = new Map<string, any>();
    for (const doc of documents) {
      if (!userMap.has(doc.userId)) {
        userMap.set(doc.userId, {
          userId: doc.userId,
          user: doc.user,
          documents: [],
          submittedAt: doc.submittedAt,
        });
      }
      userMap.get(doc.userId).documents.push({
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        status: doc.status,
        submittedAt: doc.submittedAt,
      });
    }

    return Array.from(userMap.values());
  },

  /**
   * Admin: Get single KYC submission details.
   */
  async getKycById(kycId: string) {
    const documents = await prisma.kycDocument.findMany({
      where: { userId: kycId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            country: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
            dateOfBirth: true,
            idDocumentType: true,
            kycStatus: true,
            kycSubmittedAt: true,
            riskScore: true,
            amlChecked: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return documents;
  },

  /**
   * Admin: Approve KYC submission.
   */
  async approveKyc(userId: string, adminId: string, notes?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if (user.kycStatus !== 'PENDING') {
      throw new Error('User does not have pending KYC');
    }

    // Approve all pending documents
    await prisma.kycDocument.updateMany({
      where: { userId, status: 'PENDING' },
      data: {
        status: 'APPROVED',
        reviewerId: adminId,
        reviewerNotes: notes,
        reviewedAt: new Date(),
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'APPROVED',
        kycVerifiedAt: new Date(),
        kycAdminId: adminId,
      },
    });

    // Create compliance log
    await prisma.complianceLog.create({
      data: {
        userId,
        action: 'KYC_APPROVED',
        riskLevel: 'LOW',
        triggeredBy: adminId,
        details: JSON.stringify({ notes, reviewedAt: new Date().toISOString() }),
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'KYC_APPROVED',
        metadata: JSON.stringify({ adminId, notes }),
      },
    });

    // Create default USD wallet for newly approved user
    const existingWallet = await prisma.wallet.findFirst({
      where: { userId, currency: 'USD', isDefault: true },
    });
    if (!existingWallet) {
      await prisma.wallet.create({
        data: {
          userId,
          currency: 'USD',
          balance: 0,
          isDefault: true,
        },
      });
    }

    return { message: 'KYC approved successfully', userId, status: 'APPROVED' };
  },

  /**
   * Admin: Reject KYC submission.
   */
  async rejectKyc(userId: string, adminId: string, reason: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Reject all pending documents
    await prisma.kycDocument.updateMany({
      where: { userId, status: 'PENDING' },
      data: {
        status: 'REJECTED',
        reviewerId: adminId,
        rejectionReason: reason,
        reviewedAt: new Date(),
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'REJECTED',
        kycAdminId: adminId,
      },
    });

    // Compliance log
    await prisma.complianceLog.create({
      data: {
        userId,
        action: 'KYC_REJECTED',
        riskLevel: 'MEDIUM',
        triggeredBy: adminId,
        details: JSON.stringify({ reason, reviewedAt: new Date().toISOString() }),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'KYC_REJECTED',
        metadata: JSON.stringify({ adminId, reason }),
      },
    });

    return { message: 'KYC rejected', userId, status: 'REJECTED', reason };
  },

  /**
   * Basic AML check for a user.
   */
  async performAmlCheck(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { sentTransactions: { orderBy: { timestamp: 'desc' }, take: 50 } },
    });

    if (!user) throw new Error('User not found');

    const riskFactors: string[] = [];
    let riskScore = 0;

    // Country risk assessment
    const highRiskCountries = ['IR', 'KP', 'SY', 'CU', 'VE'];
    if (highRiskCountries.includes(user.country)) {
      riskScore += 50;
      riskFactors.push('High-risk country');
    }

    // Transaction volume analysis
    const totalSent = user.sentTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);
    const highValueTx = user.sentTransactions.filter((tx: any) => tx.amount > 10000).length;
    if (highValueTx > 5) {
      riskScore += 20;
      riskFactors.push('Multiple high-value transactions');
    }

    // Rapid transaction pattern
    if (user.sentTransactions.length > 20) {
      const recentTx = user.sentTransactions.slice(0, 10);
      const oldest = recentTx[recentTx.length - 1]?.timestamp;
      const newest = recentTx[0]?.timestamp;
      if (oldest && newest) {
        const hours = (newest.getTime() - oldest.getTime()) / (1000 * 60 * 60);
        if (hours < 24 && recentTx.length > 5) {
          riskScore += 15;
          riskFactors.push('Rapid transaction pattern');
        }
      }
    }

    // Determine risk level
    let riskLevel: string;
    if (riskScore >= 70) riskLevel = 'CRITICAL';
    else if (riskScore >= 40) riskLevel = 'HIGH';
    else if (riskScore >= 20) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    // Update user risk score
    await prisma.user.update({
      where: { id: userId },
      data: {
        riskScore,
        amlChecked: true,
        amlCheckedAt: new Date(),
      },
    });

    // Create compliance log
    await prisma.complianceLog.create({
      data: {
        userId,
        action: 'AML_CHECK',
        riskLevel: riskLevel as any,
        riskScore,
        details: JSON.stringify({ factors: riskFactors, totalSent, highValueTx }),
        triggeredBy: 'SYSTEM',
      },
    });

    return {
      userId,
      riskScore,
      riskLevel,
      factors: riskFactors,
      assessedAt: new Date().toISOString(),
    };
  },
};
