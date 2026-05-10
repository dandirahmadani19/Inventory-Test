import 'dotenv/config';
import app from './app';
import prisma from './infrastructure/database/prisma.client';
import logger from './infrastructure/logging/logger';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function bootstrap() {
  try {
    // Verify DB connection on startup
    await prisma.$connect();
    logger.info({
      method: 'BOOT',
      path: '/db',
      status: 200,
      ms: 0,
    });

    app.listen(PORT, () => {
      logger.info({
        method: 'BOOT',
        path: `http://localhost:${PORT}`,
        status: 200,
        ms: 0,
      });

      if (process.env.NODE_ENV !== 'production') {
        logger.info({
          method: 'BOOT',
          path: `http://localhost:${PORT}/api/docs`,
          status: 200,
          ms: 0,
        });
      }
    });
  } catch (err) {
    logger.error({
      method: 'BOOT',
      path: '/startup',
      status: 500,
      ms: 0,
      errCode: 'STARTUP_ERROR',
      errMsg: (err as Error).message,
    });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
