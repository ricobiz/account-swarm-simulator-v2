#!/usr/bin/env node

import { createServer } from 'net';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Check if a port is free
 */
async function isPortFree(port, host = 'localhost') {
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
 */
async function pickPort(preferred, host = 'localhost') {
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

async function startApp() {
  try {
    // Pick an available port for the web app
    const preferredPort = 3000;
    const port = await pickPort(preferredPort);
    
    console.log(`🌐 Starting web app on port ${port}...`);
    
    // Set the PORT environment variable for the Next.js app
    process.env.PORT = port.toString();
    
    // Change to the web app directory
    const webAppDir = join(__dirname, '..');
    
    // Start the Vite dev server or preview depending on mode
    const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
    const command = isDev ? 'dev' : 'preview';
    const args = isDev ? ['run', command] : ['run', command, '--', '--port', port.toString()];
    
    const child = spawn('npm', args, {
      cwd: webAppDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: port.toString()
      }
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down web app...');
      child.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down web app...');
      child.kill('SIGTERM');
    });
    
    child.on('exit', (code) => {
      process.exit(code);
    });
    
  } catch (error) {
    console.error('❌ Failed to start web app:', error);
    process.exit(1);
  }
}

startApp();