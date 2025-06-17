
import { chromium } from 'playwright';

export class BrowserLauncher {
  constructor(proxy = null) {
    this.proxy = proxy;
  }

  async launch() {
    const launchOptions = {
      headless: process.env.NODE_ENV === 'production',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor',
        '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end'
      ]
    };

    if (this.proxy) {
      launchOptions.proxy = {
        server: `http://${this.proxy.ip}:${this.proxy.port}`,
        username: this.proxy.username,
        password: this.proxy.password
      };
    }

    return await chromium.launch(launchOptions);
  }

  createContextOptions(fingerprint, storageState) {
    return {
      userAgent: fingerprint.userAgent,
      viewport: fingerprint.viewport,
      locale: fingerprint.locale,
      timezoneId: fingerprint.timezone,
      permissions: ['notifications'],
      storageState
    };
  }

  async setupAdvancedAntiDetect(page) {
    // Скрываем webdriver
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      
      // Убираем chrome.runtime
      delete window.chrome?.runtime;
      
      // Модифицируем navigator.plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5].map(() => ({ name: 'Plugin' }))
      });
      
      // Модифицируем navigator.languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en']
      });
    });

    // Перехватываем и модифицируем заголовки
    await page.route('**/*', async (route) => {
      const headers = {
        ...route.request().headers(),
        'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'upgrade-insecure-requests': '1'
      };
      
      await route.continue({ headers });
    });
  }
}
