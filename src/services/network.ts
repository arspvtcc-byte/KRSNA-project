export interface ServerConfig {
  httpBase: string;
  wsBase: string;
}

class NetworkManager {
  private static instance: NetworkManager;
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageListeners: ((data: any) => void)[] = [];
  private statusListeners: ((connected: boolean) => void)[] = [];

  private currentConfig: ServerConfig = {
    httpBase: localStorage.getItem('KRSNA_HTTP_URL') || 'http://127.0.0.1:3001',
    wsBase: localStorage.getItem('KRSNA_WS_URL') || 'ws://127.0.0.1:3000'
  };

  private constructor() {}

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  public async resolveEndpointsFromGitHub(manifestUrl?: string): Promise<ServerConfig> {
    const targetUrl = manifestUrl || 'https://raw.githubusercontent.com/arspvtcc-byte/KRSNA-project/main/server-endpoint.json';
    try {
      const res = await fetch(targetUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.httpBase && data.wsBase) {
          this.currentConfig = {
            httpBase: data.httpBase,
            wsBase: data.wsBase
          };
          localStorage.setItem('KRSNA_HTTP_URL', data.httpBase);
          localStorage.setItem('KRSNA_WS_URL', data.wsBase);
          return this.currentConfig;
        }
      }
    } catch {
      console.warn('Remote manifest unreachable, using cached/local endpoints.');
    }
    return this.currentConfig;
  }

  public connectWebSocket(deviceId: string) {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = `${this.currentConfig.wsBase}/ws?deviceId=${encodeURIComponent(deviceId)}`;
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyStatus(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.messageListeners.forEach(listener => listener(payload));
        } catch {
          this.messageListeners.forEach(listener => listener(event.data));
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.notifyStatus(false);
        this.scheduleReconnect(deviceId);
      };

      this.socket.onerror = () => {
        this.socket?.close();
      };
    } catch {
      this.scheduleReconnect(deviceId);
    }
  }

  private scheduleReconnect(deviceId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 15000);
      setTimeout(() => {
        this.connectWebSocket(deviceId);
      }, delay);
    }
  }

  public sendMessage(payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  public onMessage(listener: (data: any) => void) {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  public onStatusChange(listener: (connected: boolean) => void) {
    this.statusListeners.push(listener);
    listener(this.isConnected);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private notifyStatus(connected: boolean) {
    this.statusListeners.forEach(listener => listener(connected));
  }

  public getConfig(): ServerConfig {
    return this.currentConfig;
  }
}

export const networkManager = NetworkManager.getInstance();
