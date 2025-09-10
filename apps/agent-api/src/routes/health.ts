import { Request, Response } from 'express';
import { runPreflightChecks } from '../lib/preflight.js';

/**
 * Health check endpoint handler
 * GET /v1/health
 */
export async function healthHandler(req: Request, res: Response) {
  try {
    const healthData = await runPreflightChecks();
    
    // Set appropriate HTTP status code
    const statusCode = healthData.overall === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      status: healthData.overall,
      timestamp: healthData.timestamp,
      checks: healthData.checks,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 'not set'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Internal server error',
      checks: [],
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 'not set'
    });
  }
}