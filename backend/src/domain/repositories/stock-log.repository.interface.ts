import { StockLogEntity } from '../entities/stock-log.entity';

export interface CreateStockLogInput {
  productId: number;
  change: number;
  note?: string;
}

export interface IStockLogRepository {
  create(input: CreateStockLogInput, txClient: unknown): Promise<StockLogEntity>;
}
