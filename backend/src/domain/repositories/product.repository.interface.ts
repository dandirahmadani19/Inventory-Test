import { ProductEntity } from '../entities/product.entity';
import { CategoryEntity } from '../entities/category.entity';

export type ProductWithCategory = ProductEntity & {
  category: CategoryEntity;
};

export interface IProductRepository {
  findAll(): Promise<ProductWithCategory[]>;
  findById(id: number): Promise<ProductWithCategory | null>;
  /**
   * Reduce stock inside a transaction with pessimistic locking.
   * Returns updated product stock.
   */
  reduceStockWithLock(
    id: number,
    amount: number,
    txClient: unknown,
  ): Promise<ProductWithCategory>;
}
