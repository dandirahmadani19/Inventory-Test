import { PrismaClient } from '@prisma/client';
import { IProductRepository, ProductWithCategory } from '../../../domain/repositories/product.repository.interface';

export class ProductPrismaRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<ProductWithCategory[]> {
    // Eager loading kategori + hanya pilih field yang diperlukan (Query Optimization)
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: { id: true, name: true, createdAt: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<ProductWithCategory | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  /**
   * NOTE: reduceStockWithLock is handled directly by ReduceStockUseCase
   * using $queryRaw + tx for pessimistic locking.
   * This method is retained as part of interface compliance.
   */
  async reduceStockWithLock(
    id: number,
    amount: number,
    txClient: unknown,
  ): Promise<ProductWithCategory> {
    const tx = txClient as PrismaClient;
    return tx.product.update({
      where: { id },
      data: { stock: { decrement: amount } },
      include: { category: true },
    });
  }
}
