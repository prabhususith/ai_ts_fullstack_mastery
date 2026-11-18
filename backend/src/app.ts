/**
 * @file app.ts
 * @description Express Application Factory and Middleware Pipeline.
 * Configures Helmet security headers, CORS policies, JSON parsers, and centralized routes.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './api/middlewares/errorHandler';

// Route imports
import chatRoutes from './api/routes/chatRoutes';
import ragRoutes from './api/routes/ragRoutes';
import mcpRoutes from './api/routes/mcpRoutes';
import agentRoutes from './api/routes/agentRoutes';
import adminRoutes from './api/routes/adminRoutes';
import multimodalRoutes from './api/routes/multimodalRoutes';
import alignmentRoutes from './api/routes/alignmentRoutes';
import evalsRoutes from './api/routes/evalsRoutes';
import governanceRoutes from './api/routes/governanceRoutes';

export function createApp(): Application {
  const app = express();

  // 1. Cybersecurity Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'http://localhost:*', 'ws://localhost:*'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. CORS configuration
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
    })
  );

  // 3. Body parsers with payload limits
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // 4. Request logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (env.NODE_ENV !== 'test') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    }
    next();
  });

  // 5. API Routes
  app.use('/api/chat', chatRoutes);
  app.use('/api/rag', ragRoutes);
  app.use('/api/mcp', mcpRoutes);
  app.use('/api/agents', agentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/multimodal', multimodalRoutes);
  app.use('/api/alignment', alignmentRoutes);
  app.use('/api/evals', evalsRoutes);
  app.use('/api/governance', governanceRoutes);

  // Health alias for K8s probes and container healthchecks
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'HEALTHY', uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() });
  });

  // 6. Base / ping check
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Enterprise AI TypeScript Full-Stack API',
      version: '1.0.0',
      status: 'OPERATIONAL',
      docs: '/api/admin/threat-model',
    });
  });

  // 7. Centralized RFC 7807 Error Responder
  app.use(errorHandler);

  return app;
}
