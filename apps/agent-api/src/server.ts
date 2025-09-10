import express from 'express';
import cors from 'cors';
import { pickPort } from './lib/port.js';
import { healthHandler } from './routes/health.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/v1/health', healthHandler);

// Basic info route
app.get('/', (req, res) => {
  res.json({
    name: 'Agent API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  try {
    // Pick an available port
    const preferredPort = 3001; // Different from web app port
    const port = await pickPort(preferredPort);
    
    app.listen(port, () => {
      console.log(`🚀 Agent API Server started on port ${port}`);
      console.log(`📊 Health endpoint: http://localhost:${port}/v1/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      if (process.env.RAILWAY_ENVIRONMENT) {
        console.log('🚂 Running on Railway platform');
      } else {
        console.log('💻 Running in local environment');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();