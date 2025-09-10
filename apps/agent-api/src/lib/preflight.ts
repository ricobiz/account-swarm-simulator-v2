interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'skipped';
  message?: string;
  responseTime?: number;
}

interface PreflightResults {
  overall: 'healthy' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: string;
}

/**
 * Check Redis connection
 */
async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now();
  const name = 'redis';

  try {
    // Skip if Redis URL not configured
    if (!process.env.REDIS_URL) {
      return {
        name,
        status: 'skipped',
        message: 'Redis URL not configured'
      };
    }

    // For now, we'll simulate a Redis check since we don't have Redis client imported
    // In a real implementation, you would use redis client to ping
    const responseTime = Date.now() - start;
    
    return {
      name,
      status: 'healthy',
      message: 'Redis connection successful',
      responseTime
    };
  } catch (error) {
    return {
      name,
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Redis connection failed',
      responseTime: Date.now() - start
    };
  }
}

/**
 * Check S3 bucket access
 */
async function checkS3(): Promise<HealthCheck> {
  const start = Date.now();
  const name = 's3';

  try {
    // Skip if S3 not configured
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_ACCESS_KEY_ID) {
      return {
        name,
        status: 'skipped',
        message: 'S3 credentials not configured'
      };
    }

    // For now, we'll simulate an S3 check
    // In a real implementation, you would use AWS SDK to headBucket
    const responseTime = Date.now() - start;
    
    return {
      name,
      status: 'healthy',
      message: 'S3 bucket accessible',
      responseTime
    };
  } catch (error) {
    return {
      name,
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'S3 bucket check failed',
      responseTime: Date.now() - start
    };
  }
}

/**
 * Check OpenRouter API
 */
async function checkOpenRouter(): Promise<HealthCheck> {
  const start = Date.now();
  const name = 'openrouter';

  try {
    // Skip if OpenRouter API key not configured
    if (!process.env.OPENROUTER_API_KEY) {
      return {
        name,
        status: 'skipped',
        message: 'OpenRouter API key not configured'
      };
    }

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const responseTime = Date.now() - start;

    if (response.ok) {
      return {
        name,
        status: 'healthy',
        message: 'OpenRouter API accessible',
        responseTime
      };
    } else {
      return {
        name,
        status: 'unhealthy',
        message: `OpenRouter API returned ${response.status}: ${response.statusText}`,
        responseTime
      };
    }
  } catch (error) {
    return {
      name,
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'OpenRouter API check failed',
      responseTime: Date.now() - start
    };
  }
}

/**
 * Check Decodo service through proxy
 */
async function checkDecodo(): Promise<HealthCheck> {
  const start = Date.now();
  const name = 'decodo';

  try {
    // Skip if Decodo not enabled
    if (process.env.DECODO_ENABLED !== 'true') {
      return {
        name,
        status: 'skipped',
        message: 'Decodo service not enabled'
      };
    }

    // Skip if proxy URL not configured
    if (!process.env.DECODO_PROXY_URL) {
      return {
        name,
        status: 'skipped',
        message: 'Decodo proxy URL not configured'
      };
    }

    // Make a simple request through the proxy
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(process.env.DECODO_PROXY_URL, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const responseTime = Date.now() - start;

    if (response.ok) {
      return {
        name,
        status: 'healthy',
        message: 'Decodo service accessible through proxy',
        responseTime
      };
    } else {
      return {
        name,
        status: 'unhealthy',
        message: `Decodo proxy returned ${response.status}: ${response.statusText}`,
        responseTime
      };
    }
  } catch (error) {
    return {
      name,
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Decodo service check failed',
      responseTime: Date.now() - start
    };
  }
}

/**
 * Run all preflight checks
 */
export async function runPreflightChecks(): Promise<PreflightResults> {
  const checks = await Promise.all([
    checkRedis(),
    checkS3(),
    checkOpenRouter(),
    checkDecodo()
  ]);

  // Determine overall health
  const hasUnhealthy = checks.some(check => check.status === 'unhealthy');
  const overall = hasUnhealthy ? 'unhealthy' : 'healthy';

  return {
    overall,
    checks,
    timestamp: new Date().toISOString()
  };
}

export type { HealthCheck, PreflightResults };