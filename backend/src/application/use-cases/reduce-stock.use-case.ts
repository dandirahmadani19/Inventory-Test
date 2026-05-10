import { PrismaClient } from '@prisma/client';
import { IProductRepository, ProductWithCategory } from '../../domain/repositories/product.repository.interface';
import { IStockLogRepository } from '../../domain/repositories/stock-log.repository.interface';
import { ReduceStockDto } from '../dtos/reduce-stock.dto';
import { NotFoundError, InsufficientStockError } from '../errors/app.error';
import { ReduceStockResponseData } from '../../shared/types';

interface ReduceStockResult {
  product: ProductWithCategory;
  stockLog: {
    id: number;
    productId: number;
    change: number;
    note?: string | null;
    createdAt: Date;
  };
}

export class ReduceStockUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly productRepository: IProductRepository,
    private readonly stockLogRepository: IStockLogRepository,
  ) {}

  async execute(productId: number, dto: ReduceStockDto): Promise<ReduceStockResult> {
    return this.prisma.$transaction(async (tx) => {
      // ── Step 1: Fetch product with pessimistic lock (SELECT FOR UPDATE) ──
      // This ensures concurrent requests queue up and prevent race conditions.
      const rows = await tx.$queryRaw<Array<{ id: number; stock: number; name: string; category_id: number }>>`
        SELECT id, name, stock, category_id FROM products WHERE id = ${productId} FOR UPDATE
      `;

      if (rows.length === 0) {
        throw new NotFoundError('Product', productId);
      }

      const lockedProduct = rows[0];

      // ── Step 2: Validate sufficient stock ──
      if (lockedProduct.stock < dto.amount) {
        throw new InsufficientStockError(lockedProduct.stock, dto.amount);
      }

      // ── Step 3: Deduct stock ──
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: dto.amount } },
        include: { category: true },
      });

      // ── Step 4: Record StockLog ──
      const stockLog = await tx.stockLog.create({
        data: {
          productId,
          change: -dto.amount,
          note: dto.note,
        },
      });

      return { product: updatedProduct, stockLog };
    });
  }
}
