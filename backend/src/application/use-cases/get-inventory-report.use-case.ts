import { IProductRepository, ProductWithCategory } from '../../domain/repositories/product.repository.interface';
import { LOW_STOCK_THRESHOLD } from '../../shared/constants/error-codes';

export interface InventoryReportResult {
  products: ProductWithCategory[];
  total: number;
  lowStockCount: number;
}

export class GetInventoryReportUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<InventoryReportResult> {
    // JOIN + Eager Loading kategori — handled by Prisma include in repository
    const products = await this.productRepository.findAll();

    return {
      products,
      total: products.length,
      lowStockCount: products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length,
    };
  }
}
