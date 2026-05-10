import { PrismaClient } from '@prisma/client';

// Singleton pattern — reuse the same PrismaClient across the application
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export default prisma;
