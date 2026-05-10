import { Request, Response, NextFunction } from 'express';
import { ReduceStockUseCase } from '../../application/use-cases/reduce-stock.use-case';
import { GetInventoryReportUseCase } from '../../application/use-cases/get-inventory-report.use-case';
import { NotFoundError } from '../../application/errors/app.error';

interface HandlerDeps {
  reduceStockUseCase: ReduceStockUseCase;
  getInventoryReportUseCase: GetInventoryReportUseCase;
}

export function createInventoryHandler(deps: HandlerDeps) {
  return {
    /**
     * GET /api/inventory/report
     * Returns all products with their categories (eager loaded).
     */
    getReport: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const result = await deps.getInventoryReportUseCase.execute();

        res.status(200).json({
          success: true,
          data: result.products.map((p) => ({
            id: p.id,
            name: p.name,
            stock: p.stock,
            categoryId: p.categoryId,
            category: { id: p.category.id, name: p.category.name },
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          })),
          meta: {
            total: result.total,
            lowStockCount: result.lowStockCount,
          },
        });
      } catch (err) {
        next(err);
      }
    },

    /**
     * PATCH /api/inventory/:id/reduce
     * Reduces stock for a product. Uses DB transaction + pessimistic locking.
     */
    reduceStock: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const productId = parseInt(req.params.id, 10);
        if (isNaN(productId)) {
          throw new NotFoundError('Product', req.params.id);
        }

        const result = await deps.reduceStockUseCase.execute(productId, req.body);

        res.status(200).json({
          success: true,
          message: 'Stock reduced successfully',
          data: {
            product: {
              id: result.product.id,
              name: result.product.name,
              stock: result.product.stock,
              updatedAt: result.product.updatedAt,
            },
            stockLog: {
              id: result.stockLog.id,
              productId: result.stockLog.productId,
              change: result.stockLog.change,
              note: result.stockLog.note,
              createdAt: result.stockLog.createdAt,
            },
          },
        });
      } catch (err) {
        next(err);
      }
    },
  };
}
