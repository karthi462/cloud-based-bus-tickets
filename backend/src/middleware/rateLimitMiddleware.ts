import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitRecord>();

export const rateLimiter = (maxRequests: number = 30, windowSeconds: number = 60) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = ipMap.get(ip);

    if (!record || now > record.resetAt) {
      ipMap.set(ip, {
        count: 1,
        resetAt: now + windowSeconds * 1000,
      });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.status(429).json({
        success: false,
        message: `Too many requests. Please try again after ${waitSeconds} seconds.`,
      });
      return;
    }

    record.count += 1;
    next();
  };
};
