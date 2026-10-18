/**
 * @file server.ts
 * @description HTTP and WebSocket Server Entry Point with Graceful Shutdown.
 * Manages server lifecycle, WebSocket heartbeats, database pool drainage, and process signals.
 */

import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createApp } from './app';
import { env } from './config/env';
import { db } from './db/connection';
import { redis } from './cache/redisClient';
import { embeddings } from './ai/nlp/embeddingsEngine';

const app = createApp();
const server = http.createServer(app);

// Initialize WebSocket server for real-time agent monitors and metrics
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to Enterprise AI WebSocket Hub' }));

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch {
      // Ignore malformed WS frames
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error:', err.message);
  });
});

/**
 * Broadcasts an event to all connected WebSocket clients.
 */
export function broadcastWsEvent(event: { type: string; payload: any }): void {
  const data = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

/**
 * Boot sequence
 */
async function bootstrap(): Promise<void> {
  console.log('🚀 Initializing Enterprise Full-Stack AI Ecosystem...');

  // Initialize DB and extension
  await db.initialize();

  // Initialize Embeddings Engine
  embeddings.initialize().catch((err) => {
    console.warn('Embeddings warm-up async notice:', err.message);
  });

  server.listen(env.PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`⚡ Enterprise AI Backend running on: http://localhost:${env.PORT}`);
    console.log(`⚡ WebSocket Server active on: ws://localhost:${env.PORT}/ws`);
    console.log(`⚡ Active Cloud Provider: ${env.CLOUD_PROVIDER}`);
    console.log(`⚡ Environment: ${env.NODE_ENV}`);
    console.log(`=============================================================\n`);
  });
}

/**
 * Graceful termination handler
 */
async function handleShutdown(signal: string): Promise<void> {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);

  // Close HTTP server to stop accepting new requests
  server.close(() => {
    console.log('🛑 HTTP server closed.');
  });

  // Close WebSocket connections
  for (const client of wss.clients) {
    client.terminate();
  }
  wss.close();
  console.log('🛑 WebSocket server closed.');

  // Drain PostgreSQL connection pool
  await db.close();

  // Disconnect Redis
  await redis.close();

  console.log('✅ Enterprise AI Backend shut down cleanly.');
  process.exit(0);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

process.on('unhandledRejection', (reason: any) => {
  console.error('🚨 Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err: Error) => {
  console.error('🚨 Uncaught Exception:', err);
  process.exit(1);
});

bootstrap().catch((err) => {
  console.error('❌ FATAL Boot Failure:', err);
  process.exit(1);
});
