import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RoleType } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: RoleType;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJwt = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization required. Please log in to RAzy.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Session expired or invalid credentials.' });
  }
};

export const requireRoles = (roles: RoleType[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to authorized RAzy roles [${roles.join(', ')}]`,
      });
    }
    next();
  };
};