
import { config } from 'dotenv';

config();

export const CONFIG = {
  supabase: {
    url: process.env.SUPABASE_URL || 'https://izmgzstdgoswlozinmyk.supabase.co',
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  },
  automation: {
    maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS) || 3,
    checkInterval: parseInt(process.env.CHECK_INTERVAL) || 30000,
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ]
  }
};
