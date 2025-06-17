
import { CONFIG } from './config.js';

export class AntiDetectManager {
  constructor() {
    this.fingerprints = new Map();
  }

  generateFingerprint(accountId) {
    if (this.fingerprints.has(accountId)) {
      return this.fingerprints.get(accountId);
    }

    const fingerprint = {
      userAgent: this.getRandomUserAgent(),
      viewport: this.getRandomViewport(),
      timezone: this.getRandomTimezone(),
      locale: this.getRandomLocale(),
      webgl: this.generateWebGLFingerprint(),
      canvas: this.generateCanvasFingerprint(),
      audio: this.generateAudioFingerprint(),
      screen: this.generateScreenFingerprint(),
      fonts: this.getRandomFonts(),
      plugins: this.getRandomPlugins()
    };

    this.fingerprints.set(accountId, fingerprint);
    return fingerprint;
  }

  getRandomUserAgent() {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  getRandomViewport() {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1280, height: 720 },
      { width: 1536, height: 864 }
    ];
    return viewports[Math.floor(Math.random() * viewports.length)];
  }

  getRandomTimezone() {
    const timezones = [
      'America/New_York',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Australia/Sydney'
    ];
    return timezones[Math.floor(Math.random() * timezones.length)];
  }

  getRandomLocale() {
    const locales = ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'es-ES', 'ja-JP'];
    return locales[Math.floor(Math.random() * locales.length)];
  }

  generateWebGLFingerprint() {
    return {
      vendor: Math.random() > 0.5 ? 'Google Inc.' : 'Mozilla',
      renderer: Math.random() > 0.5 ? 'ANGLE (Intel HD Graphics)' : 'WebKit WebGL'
    };
  }

  generateCanvasFingerprint() {
    return {
      noise: Math.random() * 0.01,
      offset: Math.floor(Math.random() * 5)
    };
  }

  generateAudioFingerprint() {
    return {
      oscillator: Math.random() * 100,
      maxChannelCount: Math.random() > 0.5 ? 2 : 6
    };
  }

  generateScreenFingerprint() {
    return {
      colorDepth: Math.random() > 0.5 ? 24 : 32,
      pixelRatio: Math.random() > 0.5 ? 1 : 2
    };
  }

  getRandomFonts() {
    const fonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 
      'Verdana', 'Georgia', 'Palatino', 'Garamond'
    ];
    return fonts.sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 4));
  }

  getRandomPlugins() {
    const plugins = [
      'Chrome PDF Plugin', 'Chromium PDF Plugin', 'Microsoft Edge PDF Plugin',
      'WebKit built-in PDF', 'Chrome PDF Viewer'
    ];
    return plugins.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3));
  }

  async applyFingerprint(page, fingerprint) {
    // Применяем WebGL fingerprint
    await page.addInitScript((fingerprint) => {
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return fingerprint.webgl.vendor;
        if (parameter === 37446) return fingerprint.webgl.renderer;
        return getParameter.apply(this, arguments);
      };
    }, fingerprint);

    // Применяем Canvas fingerprint
    await page.addInitScript((fingerprint) => {
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function() {
        const context = this.getContext('2d');
        if (context) {
          context.fillText(`noise_${fingerprint.canvas.noise}`, fingerprint.canvas.offset, fingerprint.canvas.offset);
        }
        return originalToDataURL.apply(this, arguments);
      };
    }, fingerprint);

    // Применяем Screen fingerprint
    await page.addInitScript((fingerprint) => {
      Object.defineProperty(screen, 'colorDepth', {
        get: () => fingerprint.screen.colorDepth
      });
      Object.defineProperty(window, 'devicePixelRatio', {
        get: () => fingerprint.screen.pixelRatio
      });
    }, fingerprint);
  }
}
