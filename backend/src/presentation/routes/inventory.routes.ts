import { Router } from 'express';
import { createInventoryHandler } from '../handlers/inventory.handler';
import { validate } from '../middlewares/validate.middleware';
import { ReduceStockSchema } from '../../application/dtos/reduce-stock.dto';
import { ReduceStockUseCase } from '../../application/use-cases/reduce-stock.use-case';
import { GetInventoryReportUseCase } from '../../application/use-cases/get-inventory-report.use-case';
import { ProductPrismaRepository } from '../../infrastructure/database/repositories/product.prisma.repository';
import { StockLogPrismaRepository } from '../../infrastructure/database/repositories/stock-log.prisma.repository';
import prisma from '../../infrastructure/database/prisma.client';

const router = Router();

// Dependency wiring (manual DI)
const productRepo = new ProductPrismaRepository(prisma);
const stockLogRepo = new StockLogPrismaRepository(prisma);
const reduceStockUseCase = new ReduceStockUseCase(prisma, productRepo, stockLogRepo);
const getReportUseCase = new GetInventoryReportUseCase(productRepo);

const handler = createInventoryHandler({
  reduceStockUseCase,
  getInventoryReportUseCase: getReportUseCase,
});

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management endpoints
 */

/**
 * @swagger
 * /api/inventory/report:
 *   get:
 *     summary: Get all inventory products with categories
 *     tags: [Inventory]
 *     description: Returns all products with eager-loaded category data, sorted by name. Includes low-stock count in meta.
 *     responses:
 *       200:
 *         description: Inventory report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *                     lowStockCount:
 *                       type: integer
 *                       example: 3
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/report', handler.getReport);

/**
 * @swagger
 * /api/inventory/{id}/reduce:
 *   patch:
 *     summary: Reduce product stock
 *     tags: [Inventory]
 *     description: |
 *       Reduces the stock of a product by the given amount.
 *       Uses **database transaction + pessimistic locking (SELECT FOR UPDATE)** to prevent race conditions.
 *       A StockLog entry is automatically created for every successful operation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReduceStockRequest'
 *     responses:
 *       200:
 *         description: Stock reduced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Stock reduced successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *                     stockLog:
 *                       $ref: '#/components/schemas/StockLog'
 *       400:
 *         description: Validation error (invalid body)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiError'
 *                 - type: object
 *                   properties:
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                           message:
 *                             type: string
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Insufficient stock or concurrency conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               insufficient_stock:
 *                 summary: Stok tidak mencukupi
 *                 value:
 *                   success: false
 *                   errorCode: INSUFFICIENT_STOCK
 *                   message: "Stok tidak mencukupi. Stok saat ini: 2, diminta: 5"
 *               concurrency_error:
 *                 summary: Race condition terdeteksi
 *                 value:
 *                   success: false
 *                   errorCode: CONCURRENCY_ERROR
 *                   message: "Gagal, stok baru saja berubah oleh user lain. Silakan coba lagi."
 */
router.patch('/:id/reduce', validate(ReduceStockSchema), handler.reduceStock);

export default router;
