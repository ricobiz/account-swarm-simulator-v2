# Port Management and Health Check Implementation

This implementation provides automatic port checking, health monitoring, and environment-aware deployment support for the account swarm simulator.

## Features Implemented

### 1. Port Management (`apps/agent-api/src/lib/port.ts`)

- **`isPortFree(port, host)`**: Checks if a port is available
- **`pickPort(preferred, host)`**: Intelligent port selection with environment awareness

**Behavior:**
- **Railway Environment**: Always uses `process.env.PORT` (no scanning)
- **Local Environment**: 
  1. Try preferred port first
  2. Scan preferred+1 to preferred+100
  3. Fall back to system-assigned port (0) if all occupied

### 2. Health Checks (`apps/agent-api/src/lib/preflight.ts`)

Comprehensive dependency checking:
- **Redis**: PING test (requires `REDIS_URL`)
- **S3**: HeadBucket operation (requires `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`)
- **OpenRouter**: GET /models API test (requires `OPENROUTER_API_KEY`)
- **Decodo**: Proxy request test (requires `DECODO_ENABLED=true`, `DECODO_PROXY_URL`)

Each check returns:
- `status`: 'healthy' | 'unhealthy' | 'skipped'
- `message`: Descriptive status message
- `responseTime`: Time taken for the check (ms)

### 3. Health Endpoint (`/v1/health`)

**Route**: `GET /v1/health`

**Response Format**:
```json
{
  "status": "healthy|unhealthy",
  "timestamp": "2025-09-10T21:44:15.639Z",
  "checks": [...],
  "uptime": 15.224,
  "version": "1.0.0",
  "environment": "development",
  "port": "3002"
}
```

**HTTP Status Codes**:
- `200`: All critical services healthy
- `503`: One or more critical services unhealthy
- `500`: Internal server error

### 4. API Server (`apps/agent-api/src/server.ts`)

Express.js server with:
- Automatic port selection using `pickPort()`
- CORS enabled for web app integration
- Graceful shutdown handling
- Environment detection (Railway vs local)
- Health endpoint at `/v1/health`

### 5. Web App Port Management (`apps/web/bin/start.mjs`)

Smart start script that:
- Selects free port for web application
- Supports both development and production modes
- Passes correct port to Vite (dev/preview)
- Handles Railway environment correctly

## Usage Examples

### Starting the Agent API

```bash
cd apps/agent-api
npm install
npm run build
npm start
```

Output:
```
🚀 Agent API Server started on port 3001
📊 Health endpoint: http://localhost:3001/v1/health
🌍 Environment: development
💻 Running in local environment
```

### Starting the Web App

```bash
cd apps/web
npm install
npm run start          # Production mode
npm run start:dev      # Development mode
```

Output:
```
🌐 Starting web app on port 3000...
➜  Local:   http://localhost:3000/
```

### Health Check Examples

**Basic health check**:
```bash
curl http://localhost:3001/v1/health
```

**With environment variables**:
```bash
# Set Redis URL
REDIS_URL=redis://localhost:6379 npm start

# Set OpenRouter API key
OPENROUTER_API_KEY=sk-or-... npm start

# Enable Decodo checks
DECODO_ENABLED=true DECODO_PROXY_URL=http://proxy:8080 npm start
```

### Railway Deployment

The implementation automatically detects Railway environment:

```bash
# Railway automatically sets these
RAILWAY_ENVIRONMENT=true
PORT=3000

# Your app will use PORT=3000 without scanning
```

## Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `PORT` | Both | Port to use (Railway deployments) |
| `RAILWAY_ENVIRONMENT` | Both | Railway platform detection |
| `REDIS_URL` | Agent API | Redis connection string |
| `AWS_S3_BUCKET` | Agent API | S3 bucket name |
| `AWS_ACCESS_KEY_ID` | Agent API | AWS access key |
| `OPENROUTER_API_KEY` | Agent API | OpenRouter API key |
| `DECODO_ENABLED` | Agent API | Enable Decodo checks (true/false) |
| `DECODO_PROXY_URL` | Agent API | Decodo proxy URL |
| `NODE_ENV` | Both | Environment mode |

## Project Structure

```
apps/
├── agent-api/                 # Backend API server
│   ├── src/
│   │   ├── lib/
│   │   │   ├── port.ts       # Port management utilities
│   │   │   └── preflight.ts  # Health check modules
│   │   ├── routes/
│   │   │   └── health.ts     # Health endpoint
│   │   └── server.ts         # Main server
│   ├── package.json
│   └── tsconfig.json
└── web/                      # Frontend application
    ├── bin/
    │   └── start.mjs         # Smart start script
    ├── src/                  # React application
    ├── package.json
    └── vite.config.ts
```

## Testing

Run the comprehensive test suite:

```bash
./test-implementation.sh
```

This tests:
- ✅ Port checking functions
- ✅ Health endpoint functionality  
- ✅ Agent API server startup
- ✅ Web app port selection
- ✅ Railway environment support
- ✅ Local environment support

## Integration Notes

- **Backward Compatibility**: Original project structure remains intact
- **Minimal Changes**: Only adds new functionality without breaking existing code
- **Production Ready**: Handles Railway deployment requirements
- **Extensible**: Easy to add new health checks or modify port selection logic