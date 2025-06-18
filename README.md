
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/be782e9a-87fb-4bcd-845c-591777560958

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/be782e9a-87fb-4bcd-845c-591777560958) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/be782e9a-87fb-4bcd-845c-591777560958) and click on Share → Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

# 🤖 Cloud RPA Bot Integration

## Architecture Overview

The SMM platform integrates with external RPA (Robotic Process Automation) bots to perform browser automation tasks. The system consists of:

1. **Frontend Dashboard** - React/TypeScript interface for managing RPA tasks
2. **Supabase Backend** - Database and Edge Functions for task orchestration
3. **Cloud RPA Bot** - Python-based automation service deployed on Railway

## Cloud RPA Bot Deployment

### Prerequisites

- GitHub account
- Railway account (linked to GitHub)
- Access to Supabase project settings

### Step 1: Create RPA Bot Repository

1. Create a new GitHub repository: `your-username/rpa-bot-cloud`
2. Make it **private** for security
3. Upload all files from the `rpa-bot-cloud/` folder to repository root:
   - `rpa_bot_cloud.py` - Main bot service
   - `Dockerfile` - Container configuration
   - `requirements.txt` - Python dependencies
   - `start.sh` - Container startup script
   - `railway.json` - Railway deployment config
   - `.env.example` - Environment variables template
   - `health-check.py` - Service health monitoring
   - `README.md` - Bot-specific documentation

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `rpa-bot-cloud` repository
4. Railway will automatically detect the Dockerfile and deploy

### Step 3: Configure Environment Variables

In Railway project settings, add these variables:

```env
SUPABASE_URL=https://izmgzstdgoswlozinmyk.supabase.co
SUPABASE_SERVICE_KEY=<your_service_role_key>
PORT=5000
PYTHONUNBUFFERED=1
DISPLAY=:99
```

**To get SUPABASE_SERVICE_KEY:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/izmgzstdgoswlozinmyk/settings/api)
2. Copy the "service_role" key from API settings

### Step 4: Get Railway URL

1. After successful deployment, go to Railway project settings
2. Navigate to "Networking" tab
3. Generate a public domain
4. Copy the URL (e.g., `https://your-bot.up.railway.app`)

### Step 5: Update Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/izmgzstdgoswlozinmyk/settings/functions)
2. Navigate to Edge Functions settings
3. Update the `RPA_BOT_ENDPOINT` secret with your Railway URL
4. **Important:** Remove trailing slashes from URL

### Step 6: Test Deployment

**Health Check:**
```bash
curl https://your-bot.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "version": "1.0.0",
  "environment": "railway"
}
```

**Full Test:**
1. Open SMM platform RPA Dashboard
2. Create test task with URL: `https://httpbin.org/get`
3. Add simple navigation action
4. Execute and verify completion

## Docker Container Structure

The RPA bot runs in a containerized environment with:

- **Base:** Python 3.11 slim
- **Browser:** Google Chrome + ChromeDriver
- **Display:** Xvfb virtual display server
- **Framework:** Flask web server + Selenium automation
- **Security:** Headless browser with anti-detection features

### Local Development

```bash
# Clone RPA bot repository
git clone https://github.com/your-username/rpa-bot-cloud.git
cd rpa-bot-cloud

# Build Docker image
docker build -t rpa-bot-cloud .

# Run locally
docker run -p 5000:5000 \
  -e SUPABASE_URL=https://izmgzstdgoswlozinmyk.supabase.co \
  -e SUPABASE_SERVICE_KEY=your_key \
  rpa-bot-cloud
```

## CI/CD Pipeline

### GitHub Actions Integration

Create `.github/workflows/deploy.yml` in your RPA bot repository:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Install Railway CLI
      run: npm install -g @railway/cli
    
    - name: Deploy to Railway
      run: railway up --detach
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
    
    - name: Health Check
      run: |
        sleep 30
        curl -f ${{ secrets.RAILWAY_URL }}/health || exit 1
```

### Automated Testing

The system includes automated health checks and integration tests:

1. **Health Endpoint** - `/health` returns service status
2. **Capability Check** - `/status` lists available automation features
3. **Integration Test** - Full workflow test through platform
4. **Error Monitoring** - Automatic failure notifications

### Environment Management

Different environments are supported:

- **Development** - Local Docker container
- **Staging** - Railway preview deployments
- **Production** - Railway production with monitoring

## Monitoring and Scaling

### Service Monitoring

Railway provides built-in monitoring:
- CPU/Memory usage tracking
- Request/response metrics
- Error rate monitoring
- Uptime statistics

### Scaling Configuration

Railway automatically scales based on:
- Request volume
- Resource utilization
- Response time thresholds

Manual scaling options:
- Replica count adjustment
- Resource limit configuration
- Geographic deployment regions

### Error Handling

The RPA bot includes comprehensive error handling:
- Automatic retry mechanisms
- Graceful failure recovery
- Detailed error logging
- Supabase integration for error tracking

## External Controller API

The platform provides REST API for external automation controllers:

### API Endpoints

- `GET /api/status` - System status and active scenarios
- `GET /api/logs?minutes=X` - Recent system logs
- `POST /api/control/stop-account` - Stop specific account
- `POST /api/control/restart-account` - Restart account tasks
- `POST /api/control/change-proxy` - Update proxy configuration
- `POST /api/control/update-settings` - Modify system settings

### Authentication

All API calls require `x-api-key` header with configured API key.

### Integration Examples

**Python Controller:**
```python
import requests

API_BASE = "https://izmgzstdgoswlozinmyk.supabase.co/functions/v1"
headers = {"x-api-key": "your-api-key"}

# Get system status
status = requests.get(f"{API_BASE}/api-status", headers=headers)
print(status.json())

# Control account
requests.post(f"{API_BASE}/api-control/stop-account", 
             headers=headers, 
             json={"accountId": "account-uuid"})
```

**Node.js Controller:**
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://izmgzstdgoswlozinmyk.supabase.co/functions/v1',
  headers: { 'x-api-key': 'your-api-key' }
});

// Monitor logs
const logs = await api.get('/api-logs?minutes=30');

// Update settings
const result = await api.post('/api-control/update-settings', {
  settings: { maxConcurrentJobs: 10 }
});
```

## Security Considerations

### API Security
- All endpoints require authentication
- Rate limiting on API calls
- Input validation and sanitization
- Audit logging for all operations

### RPA Bot Security
- Isolated container environment
- No persistent data storage
- Encrypted communication with platform
- Anti-detection browser configurations

### Data Protection
- No sensitive data stored in bot
- Secure credential management
- Encrypted database connections
- GDPR compliance measures

## Troubleshooting

### Common Issues

**Bot Not Responding:**
- Check Railway deployment logs
- Verify environment variables
- Test health endpoint

**Tasks Failing:**
- Review browser console errors
- Check Selenium WebDriver logs
- Verify target website accessibility

**Integration Problems:**
- Validate Supabase endpoint configuration
- Check API key permissions
- Review Edge Function logs

### Support Resources

- Railway deployment logs
- Supabase function monitoring
- GitHub Actions workflow history
- Docker container debugging tools

## Performance Optimization

### Resource Management
- Container resource limits
- Memory usage optimization
- CPU utilization monitoring
- Network bandwidth management

### Automation Efficiency
- Parallel task execution
- Smart retry mechanisms
- Caching strategies
- Response time optimization

## Future Enhancements

### Planned Features
- Multi-region deployment support
- Advanced scheduling capabilities
- Machine learning integration
- Enhanced monitoring dashboard

### Scalability Roadmap
- Kubernetes orchestration
- Load balancing improvements
- Database optimization
- CDN integration

---

This comprehensive setup provides a fully automated, scalable, and monitored RPA automation platform suitable for production use.
