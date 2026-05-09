import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { kycService } from '../services/kyc.service';
import { z } from 'zod';

const router = Router();

// All KYC routes require authentication
router.use(authMiddleware);

const kycUploadSchema = z.object({
  documentType: z.enum(['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'PROOF_OF_ADDRESS', 'SELFIE']),
});

// GET /api/kyc/status - Get KYC status
router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    const result = await kycService.getKycStatus(req.userId!);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/kyc/upload - Submit KYC documents
router.post('/upload', async (req: AuthRequest, res: Response) => {
  try {
    const { documents } = req.body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one document is required' });
    }

    // Validate each document entry
    for (const doc of documents) {
      kycUploadSchema.parse({ documentType: doc.documentType });
      if (!doc.fileName || !doc.fileUrl) {
        return res.status(400).json({ success: false, message: 'Each document must have fileName and fileUrl' });
      }
    }

    const result = await kycService.submitKyc(req.userId!, documents);
    res.json({ success: true, data: result });
  } catch (error: any) {
    const message = error instanceof z.ZodError ? error.errors[0].message : error.message;
    res.status(400).json({ success: false, message });
  }
});

// POST /api/kyc/resubmit - Resubmit KYC after rejection
router.post('/resubmit', async (req: AuthRequest, res: Response) => {
  try {
    const { documents } = req.body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one document is required' });
    }

    for (const doc of documents) {
      if (!doc.fileName || !doc.fileUrl || !doc.documentType) {
        return res.status(400).json({ success: false, message: 'Each document must have documentType, fileName, and fileUrl' });
      }
    }

    const result = await kycService.resubmitKyc(req.userId!, documents);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
