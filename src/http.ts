import { XPayConfig, APIResponse, XPayError } from './types';

export class HTTPClient {
  private config: XPayConfig;
  private defaultTimeout = 30000; // 30 seconds

  constructor(config: XPayConfig) {
    this.config = config;
  }

  private getBaseUrl(): string {
    if (this.config.baseUrl) {
      return this.config.baseUrl;
    }

    // Default to the central server. The server hosts separate sandbox/live
    // databases; the SDK will set the environment header so the backend
    // can route appropriately. Use `config.baseUrl` to override if needed.
    return 'https://server.xpay-bits.com';
  }

  private getHeaders(): Record<string, string> {
    // Detect environment from API key if not explicitly set
    const environment = this.getEnvironmentFromApiKey();

    return {
      'X-API-Key': this.config.apiKey,
      'Content-Type': 'application/json',
      'User-Agent': `xpay-js-sdk/1.0.0`,
      'X-SDK-Version': '1.0.0',
      'X-Environment': environment
    };
  }

  private getEnvironmentFromApiKey(): string {
    if (this.config.environment) {
      return this.config.environment;
    }

    // Auto-detect environment from API key prefix
    if (this.config.apiKey.startsWith('xpay_sandbox_') || this.config.apiKey.startsWith('pk_sandbox_') || this.config.apiKey.startsWith('sk_sandbox_')) {
      return 'sandbox';
    } else if (this.config.apiKey.startsWith('xpay_live_') || this.config.apiKey.startsWith('pk_live_') || this.config.apiKey.startsWith('sk_live_')) {
      return 'live';
    }

    // Default to sandbox for development/testing
    return 'sandbox';
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<APIResponse<T>> {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const timeout = this.config.timeout || this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const options: RequestInit = {
        method,
        headers: this.getHeaders(),
        signal: controller.signal,
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new XPayError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.error_code || 'HTTP_ERROR',
          response.status,
          errorData
        );
      }

      const result = await response.json();

      // If the backend already returns our APIResponse shape, pass it through.
      // This avoids double-wrapping when tests or servers return { success, data }.
      if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
        return result as APIResponse<T>;
      }

      // Otherwise wrap raw result into APIResponse
      return {
        success: true,
        data: result,
        message: undefined,
        error: undefined
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'AbortError') {
        throw new XPayError('Request timeout', 'TIMEOUT', 408);
      }

      if (error instanceof XPayError) {
        throw error;
      }

      throw new XPayError(
        (typeof error === 'object' && error !== null && 'message' in error) ? (error as any).message : 'Network error',
        'NETWORK_ERROR',
        undefined,
        error
      );
    }
  }

  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }
}
