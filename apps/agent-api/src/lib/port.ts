import { createServer } from 'net';

/**
 * Check if a port is free on the specified host
 * @param port - Port number to check
 * @param host - Host to check (default: 'localhost')
 * @returns Promise<boolean> - true if port is free, false if occupied
 */
export async function isPortFree(port: number, host: string = 'localhost'): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.listen(port, host, () => {
      server.close(() => {
        resolve(true);
      });
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Pick a free port starting from the preferred port
 * @param preferred - Preferred port number
 * @param host - Host to check (default: 'localhost')
 * @returns Promise<number> - A free port number
 */
export async function pickPort(preferred: number, host: string = 'localhost'): Promise<number> {
  // Railway environment: always use PORT from environment
  if (process.env.RAILWAY_ENVIRONMENT || process.env.PORT) {
    const port = parseInt(process.env.PORT || '3000');
    return port;
  }

  // Local environment: scan for free port
  // Try preferred port first
  if (await isPortFree(preferred, host)) {
    return preferred;
  }

  // Scan preferred+1 to preferred+100
  for (let port = preferred + 1; port <= preferred + 100; port++) {
    if (await isPortFree(port, host)) {
      return port;
    }
  }

  // If all ports in range are occupied, use port 0 (system assigns free port)
  return new Promise((resolve, reject) => {
    const server = createServer();
    
    server.listen(0, host, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        const port = address.port;
        server.close(() => {
          resolve(port);
        });
      } else {
        server.close(() => {
          reject(new Error('Failed to get assigned port'));
        });
      }
    });
    
    server.on('error', (error) => {
      reject(error);
    });
  });
}