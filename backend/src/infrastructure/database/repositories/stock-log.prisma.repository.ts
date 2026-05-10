import { PrismaClient } from '@prisma/client';
import { IStockLogRepository, CreateStockLogInput } from '../../../domain/repositories/stock-log.repository.interface';
import { StockLogEntity } from '../../../domain/entities/stock-log.entity';

export class StockLogPrismaRepository implements IStockLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateStockLogInput, txClient: unknown): Promise<StockLogEntity> {
    const client = (txClient as PrismaClient) ?? this.prisma;
    return client.stockLog.create({
      data: {
        productId: input.productId,
        change: input.change,
        note: input.note,
      },
    });
  }
}
