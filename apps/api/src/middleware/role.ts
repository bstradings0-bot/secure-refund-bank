import { Response, NextFunction } from 'express';
import { Role } from '@srb/shared';
import type { AuthRequest } from './auth';

export function roleMiddleware(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.role || !roles.includes(req.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
