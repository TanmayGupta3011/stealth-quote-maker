export type JobStatus = 'queued' | 'running' | 'partial' | 'complete' | 'failed';
export type ItemStatus = 'pending' | 'scraping' | 'success' | 'failed' | 'anti-bot' | 'duplicate';

export interface ProductItem {
  id: string;
  url: string;
  quantity: number;
  productName?: string;
  unitPrice?: number;
  totalPrice?: number;
  status: ItemStatus;
  screenshot?: string;
  thumbnail?: string;
  timestamp?: string;
  metadata?: {
    httpCode?: number;
    userAgent?: string;
    retryCount?: number;
    errorMessage?: string;
  };
  isDuplicate?: boolean;
  alternativeUrl?: string;
  includeInPdf?: boolean;
}

export interface Job {
  id: string;
  name: string;
  createdAt: string;
  status: JobStatus;
  progress: number;
  itemsProcessed: number;
  totalItems: number;
  grandTotal?: number;
  items: ProductItem[];
  options: JobOptions;
}

export interface JobOptions {
  vendorDedupe: boolean;
  lowestPrice: boolean;
  concurrentJobs: number;
  delayMs: number;
  userAgentRotation: boolean;
}

export interface ParsedInput {
  url: string;
  quantity: number;
  isValid: boolean;
  error?: string;
}

export interface WebSocketMessage {
  type: 'item.started' | 'item.progress' | 'item.completed' | 'item.failed' | 'job.progress' | 'anti-bot.detected';
  jobId: string;
  itemId?: string;
  data?: any;
}

export interface PDFExportOptions {
  includeAppendix: boolean;
  watermark: boolean;
  includeAuditLog: boolean;
  jobId: string;
}
