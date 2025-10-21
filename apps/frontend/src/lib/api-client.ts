/**
 * API Client - Centralized API communication
 * 
 * Handles all API requests to the backend
 */

// Prefer same-origin relative calls to leverage Vite proxy in dev and avoid CORS
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

export interface Transfer {
  id: string;
  transactionHash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
}

export interface DailyStat {
  id: string;
  date: string;
  totalVolume: string;
  transferCount: number;
  uniqueSenders: number;
  uniqueReceivers: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  confidence: number;
  timestamp: number;
  source: string;
}

export interface Alert {
  id: string;
  type: 'large_transaction' | 'treasury_yield' | 'indexer_health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  data: any;
  timestamp: number;
  resolved: boolean;
}

export interface AlertsResponse {
  alerts: Alert[];
  count: number;
  discordEnabled: boolean;
}

export interface TreasuryValueResponse {
  address: string;
  balance: string;
  balancePYUSD: number;
  valueUSD: number;
  price: number;
  timestamp: number;
}

export interface VolumeResponse {
  volume: string;
  volumePYUSD: number;
  volumeUSD: number;
  transferCount: number;
  period: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  service: string;
  dependencies: {
    envio: 'up' | 'down';
  };
}

/**
 * API Client class
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Generic fetch wrapper
   */
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async getHealth(): Promise<HealthResponse> {
    return this.fetch<HealthResponse>('/health');
  }

  /**
   * Get recent transfers
   */
  async getTransfers(limit: number = 50, offset: number = 0): Promise<Transfer[]> {
    type BackendTransfers = {
      transfers: Transfer[];
      total: number;
      hasMore: boolean;
    };
    const res = await this.fetch<BackendTransfers>(`/api/transfers?limit=${limit}&offset=${offset}`);
    return res.transfers;
  }

  /**
   * Get treasury value
   */
  async getTreasuryValue(address?: string): Promise<TreasuryValueResponse> {
    const params = address ? `?address=${address}` : '';
    type BackendTreasury = {
      totalValue: number;
      balance: number; // tokens (PYUSD, 6 decimals already handled server-side)
      balanceWei: string;
      price: number;
      priceSource: string;
      timestamp: number;
      lastUpdate: string;
    };
    const res = await this.fetch<BackendTreasury>(`/api/treasury/value${params}`);
    // Adapter → match UI expectations
    const adapted: TreasuryValueResponse = {
      address: address || '-',
      balance: res.balanceWei,
      balancePYUSD: res.balance,
      valueUSD: res.totalValue,
      price: res.price,
      timestamp: res.timestamp,
    };
    return adapted;
  }

  /**
   * Get 24h volume
   */
  async getVolume24h(): Promise<VolumeResponse> {
    type BackendVolume24h = {
      volume: number; // USD
      volumeWei: string;
      txCount: number;
      period: string;
      timestamp: number;
    };
    const res = await this.fetch<BackendVolume24h>('/api/volume/24h');
    const adapted: VolumeResponse = {
      volume: res.volumeWei,
      volumePYUSD: 0, // not provided; keep 0 for now
      volumeUSD: res.volume,
      transferCount: res.txCount,
      period: res.period,
    };
    return adapted;
  }

  /**
   * Get historical volume
   */
  async getVolumeHistory(period: string = '7d'): Promise<DailyStat[]> {
    type BackendVolumeHistory = {
      data: Array<{
        date: string; // YYYY-MM-DD
        volume: number; // USD
        volumeWei: string;
        txCount: number;
        uniqueUsers: number;
      }>;
      period: string;
    };
    const res = await this.fetch<BackendVolumeHistory>(`/api/volume/history?period=${period}`);
    // Adapter → UI expects totalVolume as string and transferCount
    return res.data.map((d) => ({
      id: d.date,
      date: d.date,
      totalVolume: String(Math.round(d.volume * 1e6)), // maintain existing chart logic (/1e6)
      transferCount: d.txCount,
      uniqueSenders: d.uniqueUsers,
      uniqueReceivers: 0,
    }));
  }

  /**
   * Get PYUSD price
   */
  async getPYUSDPrice(): Promise<PriceData> {
    return this.fetch<PriceData>('/api/price/pyusd');
  }

  /**
   * Get alerts
   */
  async getAlerts(limit: number = 20, activeOnly: boolean = false): Promise<AlertsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(activeOnly && { active: 'true' }),
    });
    return this.fetch<AlertsResponse>(`/api/alerts?${params}`);
  }

  /**
   * Get alert by ID
   */
  async getAlertById(id: string): Promise<Alert> {
    return this.fetch<Alert>(`/api/alerts/${id}`);
  }

  /**
   * Send test alert
   */
  async sendTestAlert(): Promise<{ success: boolean; alert: Alert; message: string }> {
    return this.fetch('/api/alerts/test', {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };

// Helper functions
export function formatPYUSD(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

