import 'dotenv/config';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';

const prisma = new PrismaClient();

describe('ReduceStock — Race Condition (Concurrent Requests)', () => {
  let testProductId: number;
  const INITIAL_STOCK = 10;
  const REDUCE_AMOUNT = 6; // Each request tries to reduce by 6 (total 12 > 10)

  beforeAll(async () => {
    // Create a fresh test product for isolation
    const category = await prisma.category.upsert({
      where: { name: '__test_category__' },
      update: {},
      create: { name: '__test_category__' },
    });

    const product = await prisma.product.create({
      data: {
        name: '__test_concurrent_product__',
        stock: INITIAL_STOCK,
        categoryId: category.id,
      },
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.stockLog.deleteMany({ where: { productId: testProductId } });
    await prisma.product.delete({ where: { id: testProductId } });
    await prisma.category.deleteMany({ where: { name: '__test_category__' } });
    await prisma.$disconnect();
  });

  it('should handle 2 concurrent reduce requests safely — only one succeeds when total > stock', async () => {
    // Fire 2 requests simultaneously
    const [res1, res2] = await Promise.all([
      request(app)
        .patch(`/api/inventory/${testProductId}/reduce`)
        .send({ amount: REDUCE_AMOUNT, note: 'Concurrent test request 1' }),
      request(app)
        .patch(`/api/inventory/${testProductId}/reduce`)
        .send({ amount: REDUCE_AMOUNT, note: 'Concurrent test request 2' }),
    ]);

    const statuses = [res1.status, res2.status];
    const successCount = statuses.filter((s) => s === 200).length;
    const failCount = statuses.filter((s) => s === 409).length;

    // Exactly one should succeed, one should fail with INSUFFICIENT_STOCK
    expect(successCount).toBe(1);
    expect(failCount).toBe(1);

    // The failing one should report INSUFFICIENT_STOCK
    const failedRes = res1.status === 409 ? res1 : res2;
    expect(failedRes.body.success).toBe(false);
    expect(failedRes.body.errorCode).toBe('INSUFFICIENT_STOCK');

    // Verify DB: final stock should be INITIAL_STOCK - REDUCE_AMOUNT = 4
    const product = await prisma.product.findUnique({ where: { id: testProductId } });
    expect(product?.stock).toBe(INITIAL_STOCK - REDUCE_AMOUNT);
  });

  it('should reject reduce request when stock is insufficient', async () => {
    // Reset stock to a low value
    await prisma.product.update({
      where: { id: testProductId },
      data: { stock: 2 },
    });

    const res = await request(app)
      .patch(`/api/inventory/${testProductId}/reduce`)
      .send({ amount: 5, note: 'Should fail' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('INSUFFICIENT_STOCK');
    expect(res.body.message).toContain('2');
    expect(res.body.message).toContain('5');
  });

  it('should return 400 for invalid request body', async () => {
    const res = await request(app)
      .patch(`/api/inventory/${testProductId}/reduce`)
      .send({ amount: -1 }); // negative amount is invalid

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    expect(res.body.errors).toBeDefined();
  });

  it('should return 404 for non-existent product', async () => {
    const res = await request(app)
      .patch('/api/inventory/999999/reduce')
      .send({ amount: 1 });

    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('NOT_FOUND');
  });

  it('should return inventory report with category data', async () => {
    const res = await request(app).get('/api/inventory/report');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('lowStockCount');

    // Each product should have category eager-loaded
    if (res.body.data.length > 0) {
      const product = res.body.data[0];
      expect(product).toHaveProperty('category');
      expect(product.category).toHaveProperty('id');
      expect(product.category).toHaveProperty('name');
    }
  });
});
