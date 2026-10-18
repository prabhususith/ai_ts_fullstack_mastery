/**
 * @file authMiddleware.ts
 * @description Jose-backed signed JWT verification with Role-Based Access Control (RBAC).
 * Enforces stateless, cryptographically signed tokens with claims validation.
 * @see https://github.com/panva/jose
 */

import { Request, Response, NextFunction } from 'express';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { env } from '../config/env';

export type UserRole = 'User' | 'Admin' | 'SecurityAuditor' | 'AgentExecutor';

export interface AuthUserPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

const secretKey = new TextEncoder().encode(env.JWT_SECRET);
const ISSUER = 'ai-ts-fullstack-enterprise';
const AUDIENCE = 'ai-ts-ecosystem';

export class TokenService {
  /**
   * Issues a cryptographically signed stateless JWT.
   */
  public static async generateToken(
    payload: Omit<AuthUserPayload, keyof JWTPayload>
  ): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setExpirationTime(env.JWT_EXPIRATION)
      .sign(secretKey);
  }

  /**
   * Verifies and decodes a signed JWT.
   */
  public static async verifyToken(token: string): Promise<AuthUserPayload> {
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload as AuthUserPayload;
  }
}

/**
 * Express middleware to authenticate Bearer tokens.
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      type: 'https://tools.ietf.org/html/rfc7807',
      title: 'Unauthorized',
      status: 401,
      detail: 'Missing or malformed Authorization header. Expected Bearer token.',
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  try {
    const decoded = await TokenService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      type: 'https://tools.ietf.org/html/rfc7807',
      title: 'Invalid Token',
      status: 401,
      detail: error.message || 'Token signature verification failed or token has expired.',
    });
  }
}

/**
 * Role-Based Access Control (RBAC) route guard.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication required prior to role evaluation.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Forbidden',
        status: 403,
        detail: `Access denied. Role '${req.user.role}' lacks authorization. Required: [${allowedRoles.join(', ')}]`,
      });
      return;
    }

    next();
  };
}
