// Shared TypeScript interfaces — digunakan oleh frontend & backend

export interface Category {
  id: number;
  name: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  stock: number;
  categoryId: number;
  category: Pick<Category, 'id' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

export interface StockLog {
  id: number;
  productId: number;
  change: number;
  note?: string | null;
  createdAt: string;
}

// ── Request DTOs ──────────────────────────────────────────────

export interface ReduceStockRequest {
  amount: number; // must be > 0
  note?: string;
}

// ── Response DTOs ─────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  meta: {
    total: number;
    lowStockCount: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  errorCode: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface ReduceStockResponseData {
  product: Pick<Product, 'id' | 'name' | 'stock' | 'updatedAt'>;
  stockLog: StockLog;
}
