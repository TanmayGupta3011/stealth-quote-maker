import { Job, JobOptions, PDFExportOptions, ProductItem } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // For HTTP-only cookies
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Job endpoints
  async createJob(items: { url: string; quantity: number }[], options: JobOptions): Promise<Job> {
    return this.request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify({ items, options }),
    });
  }

  async getJobs(): Promise<Job[]> {
    return this.request<Job[]>('/jobs');
  }

  async getJob(id: string): Promise<Job> {
    return this.request<Job>(`/jobs/${id}`);
  }

  async retryJob(id: string, itemIds?: string[]): Promise<Job> {
    return this.request<Job>(`/jobs/${id}/retry`, {
      method: 'POST',
      body: JSON.stringify({ itemIds }),
    });
  }

  async updateItem(jobId: string, itemId: string, updates: Partial<ProductItem>): Promise<ProductItem> {
    return this.request<ProductItem>(`/jobs/${jobId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Export endpoints
  async requestPDFExport(options: PDFExportOptions): Promise<{ exportId: string }> {
    return this.request<{ exportId: string }>(`/jobs/${options.jobId}/export`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async getPDFDownloadUrl(jobId: string, exportId: string): Promise<string> {
    return `${this.baseUrl}/jobs/${jobId}/pdf/${exportId}`;
  }

  async exportCSV(jobId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/export/csv`, {
      credentials: 'include',
    });
    return response.blob();
  }
}

export const api = new APIClient(API_BASE_URL);
