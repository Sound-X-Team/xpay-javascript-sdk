import { HTTPClient } from './http';
import { APIResponse } from './types';

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  email: string;
  name: string;
  phone?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export class CustomersAPI {
  constructor(private client: HTTPClient, private merchantId: string) {}

  /**
   * Create a new customer
   */
  async create(customerData: CreateCustomerRequest): Promise<APIResponse<Customer>> {
    return this.client.post<Customer>(`/v1/api/merchants/${this.merchantId}/customers`, customerData);
  }

  /**
   * Retrieve a customer by ID
   */
  async retrieve(customerId: string): Promise<APIResponse<Customer>> {
    return this.client.get<Customer>(`/v1/api/merchants/${this.merchantId}/customers/${customerId}`);
  }

  /**
   * Update a customer
   */
  async update(customerId: string, updateData: Partial<CreateCustomerRequest>): Promise<APIResponse<Customer>> {
    return this.client.put<Customer>(`/v1/api/merchants/${this.merchantId}/customers/${customerId}`, updateData);
  }

  /**
   * Delete a customer
   */
  async delete(customerId: string): Promise<APIResponse<{ deleted: boolean }>> {
    return this.client.delete(`/v1/api/merchants/${this.merchantId}/customers/${customerId}`);
  }

  /**
   * List all customers
   */
  async list(params?: {
    limit?: number;
    offset?: number;
    email?: string;
    name?: string;
    created_after?: string;
    created_before?: string;
  }): Promise<APIResponse<{ customers: Customer[]; total: number; has_more: boolean }>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/v1/api/merchants/${this.merchantId}/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.client.get(endpoint);
  }
}