import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { requestLoggerMiddleware } from './presentation/middlewares/request-logger.middleware';
import { errorHandlerMiddleware } from './presentation/middlewares/error-handler.middleware';
import inventoryRoutes from './presentation/routes/inventory.routes';
import { swaggerSpec, swaggerUi } from './infrastructure/swagger/swagger.config';

const app = express();

// ── Security & Parsing ────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Rate Limiting (protect reduce endpoint) ───────────────────────────────────
const reduceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: { success: false, errorCode: 'RATE_LIMITED', message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(requestLoggerMiddleware);

// ── Swagger UI (dev only) ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/inventory', reduceLimiter, inventoryRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandlerMiddleware);

export default app;
