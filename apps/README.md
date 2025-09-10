# Apps Directory

This directory contains the modularized applications for the account swarm simulator.

## Structure

- `agent-api/` - Backend API server with health checks and port management
- `web/` - Frontend web application with automatic port selection

## Agent API (`agent-api/`)

The Agent API provides:

- **Port Management**: Automatic port selection with Railway/local environment support
- **Health Checks**: Comprehensive preflight checks for dependencies
- **Health Endpoint**: `/v1/health` with detailed system status

### Features

- `lib/port.ts` - Port checking and selection utilities
- `lib/preflight.ts` - Health check modules for Redis, S3, OpenRouter, and Decodo
- `routes/health.ts` - Health endpoint implementation
- `server.ts` - Main server with automatic port selection

### Usage

```bash
cd agent-api
npm install
npm run build
npm start
```

The server will automatically:
- Use `process.env.PORT` on Railway
- Scan for free ports locally (preferred+1 to preferred+100)
- Fall back to system-assigned port (0) if needed

## Web App (`web/`)

The web application with smart port management.

### Features

- `bin/start.mjs` - Smart start script with port selection
- Automatic port conflict resolution
- Railway environment support

### Usage

```bash
cd web
npm install
npm run start          # Production mode with port selection
npm run start:dev      # Development mode with port selection
```

## Environment Variables

### Agent API
- `PORT` - Port to use (Railway deployments)
- `REDIS_URL` - Redis connection string
- `AWS_S3_BUCKET` - S3 bucket name
- `AWS_ACCESS_KEY_ID` - AWS access key
- `OPENROUTER_API_KEY` - OpenRouter API key
- `DECODO_ENABLED` - Enable Decodo checks (true/false)
- `DECODO_PROXY_URL` - Decodo proxy URL

### Web App
- `PORT` - Port to use (Railway deployments)
- `NODE_ENV` - Environment mode (development/production)