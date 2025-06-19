
import type { 
  BrowserInfo, 
  ServerScreenshot, 
  RecordedAction, 
  MacroTestResult 
} from '@/types/serverRPA';

class ServerRPAApi {
  private baseUrl = '/api/rpa';

  async getScreenshot(url: string, sessionId?: string): Promise<ServerScreenshot> {
    const response = await fetch(`${this.baseUrl}/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, sessionId })
    });

    if (!response.ok) {
      throw new Error(`Failed to get screenshot: ${response.status}`);
    }

    return response.json();
  }

  async testMacro(
    actions: RecordedAction[], 
    url: string, 
    sessionId?: string
  ): Promise<MacroTestResult> {
    const response = await fetch(`${this.baseUrl}/test-macro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions, url, sessionId })
    });

    if (!response.ok) {
      throw new Error(`Failed to test macro: ${response.status}`);
    }

    return response.json();
  }

  async executeMacro(
    actions: RecordedAction[], 
    url: string, 
    options?: { 
      humanBehavior?: boolean;
      sessionId?: string;
      deviceType?: 'desktop' | 'mobile' | 'tablet';
    }
  ): Promise<MacroTestResult> {
    const response = await fetch(`${this.baseUrl}/execute-macro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions, url, ...options })
    });

    if (!response.ok) {
      throw new Error(`Failed to execute macro: ${response.status}`);
    }

    return response.json();
  }

  async getBrowserInfo(sessionId: string): Promise<BrowserInfo> {
    const response = await fetch(`${this.baseUrl}/browser-info/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get browser info: ${response.status}`);
    }

    return response.json();
  }

  async closeBrowserSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to close session: ${response.status}`);
    }
  }
}

export const serverRPAApi = new ServerRPAApi();
