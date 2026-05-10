// Domain Entity — StockLog
export interface StockLogEntity {
  id: number;
  productId: number;
  change: number;
  note?: string | null;
  createdAt: Date;
}
