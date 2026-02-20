import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET ??
  (process.env.NODE_ENV === 'production' ? '' : 'change-me-in-production');
const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? 'token';

export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token =
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) ??
    (req as Request & { cookies?: Record<string, string> }).cookies?.[JWT_COOKIE_NAME] ??
    null;
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
    res.status(500).json({ message: 'Server misconfiguration' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as Request & { user?: { email: string } }).user = { email: decoded.sub };
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
