/**
 * @file errorHandler.ts
 * @description Centralized RFC 7807 Problem Details Error Responder.
 * Guarantees standard machine-readable JSON error payloads across all HTTP endpoints.
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../../config/env';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: any;
  stack?: string;
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status || err.statusCode || 500;
  let title = 'Internal Server Error';
  let detail = err.message || 'An unexpected error occurred processing your request.';

  const problem: ProblemDetails = {
    type: `https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/${status}`,
    title,
    status,
    detail,
    instance: req.originalUrl,
  };

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    problem.status = 400;
    problem.title = 'Bad Request - Validation Error';
    problem.detail = 'One or more request parameters failed schema validation.';
    problem.errors = err.format();
  }

  // Hide stack trace in production environments
  if (env.NODE_ENV !== 'production' && err.stack) {
    problem.stack = err.stack;
  }

  res.setHeader('Content-Type', 'application/problem+json');
  res.status(problem.status).json(problem);
}
