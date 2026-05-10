import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory Control Center API',
      version: '1.0.0',
      description:
        'Real-time Inventory Management API — mGanik Technical Assignment\n\n' +
        'Endpoints ini memungkinkan admin gudang untuk melihat laporan stok dan mengurangi stok produk secara aman (race-condition safe).',
    },
    servers: [
      { url: process.env.API_BASE_URL || 'http://localhost:3001', description: 'Development server' },
    ],
    components: {
      schemas: {
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Elektronik' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Laptop Asus VivoBook 15' },
            stock: { type: 'integer', example: 25 },
            categoryId: { type: 'integer', example: 1 },
            category: { $ref: '#/components/schemas/Category' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        StockLog: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 87 },
            productId: { type: 'integer', example: 1 },
            change: { type: 'integer', example: -5, description: 'Negative = reduce, Positive = restock' },
            note: { type: 'string', nullable: true, example: 'Pengiriman ke cabang Surabaya' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ReduceStockRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { type: 'integer', minimum: 1, example: 5, description: 'Jumlah stok yang akan dikurangi' },
            note: { type: 'string', maxLength: 255, example: 'Pengiriman ke cabang Surabaya' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            errorCode: { type: 'string', example: 'INSUFFICIENT_STOCK' },
            message: { type: 'string', example: 'Stok tidak mencukupi. Stok saat ini: 2, diminta: 5' },
          },
        },
      },
    },
  },
  // Scan @swagger annotations from route files
  apis: ['./src/presentation/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
