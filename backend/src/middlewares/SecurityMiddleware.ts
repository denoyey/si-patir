import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { EnvironmentConfig } from '../config/EnvironmentConfig.js';

export class SecurityMiddleware {
  private static config = EnvironmentConfig.getInstance();

  /**
   * Mengamankan HTTP response headers dengan Helmet (anti-XSS, clickjacking, MIME sniffing)
   */
  public static configureHelmet() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'ws:', 'wss:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    });
  }

  /**
   * Rate Limiter Umum: 120 request per menit per IP
   */
  public static generalRateLimiter() {
    return rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many requests, please slow down.',
      },
    });
  }

  /**
   * Rate Limiter Ketat untuk Webhook Endpoint: 30 request per menit
   */
  public static webhookRateLimiter() {
    return rateLimit({
      windowMs: 60 * 1000,
      max: 30,
      message: {
        success: false,
        error: 'Webhook rate limit exceeded.',
      },
    });
  }

  /**
   * Strict CORS Policy
   */
  public static configureCors() {
    return cors({
      origin: (origin, callback) => {
        // Izinkan request tanpa origin (seperti curl atau local git hook)
        if (!origin) return callback(null, true);
        if (SecurityMiddleware.config.corsOrigins.includes(origin) || origin.includes('localhost')) {
          return callback(null, true);
        }
        return callback(new Error('CORS Policy: Origin not allowed'));
      },
      methods: ['GET', 'POST', 'PUT'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Hub-Signature-256'],
      credentials: true,
    });
  }

  /**
   * Global Error Sanitizer Middleware (Mencegah Information Disclosure / Stack Leak)
   */
  public static globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    const isDev = SecurityMiddleware.config.nodeEnv === 'development';

    console.error(`[SecurityMiddleware] Handled Error at ${req.method} ${req.url}:`, err.message);

    res.status(err.status || 500).json({
      success: false,
      error: isDev ? err.message : 'Internal Server Error. Request safely handled.',
      timestamp: new Date().toISOString(),
    });
  }
}

