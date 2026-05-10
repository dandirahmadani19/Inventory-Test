import { ErrorCode, ERROR_CODES } from '../../shared/constants/error-codes';

/**
 * Base application error. All custom errors extend this.
 * Use cases throw these; the error-handler middleware converts them to HTTP responses.
 */
export class AppError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly httpStatus: number;

  constructor(message: string, errorCode: ErrorCode, httpStatus: number) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.httpStatus = httpStatus;
    // Maintain proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: number | string) {
    super(`${resource} with id ${id} not found`, ERROR_CODES.NOT_FOUND, 404);
  }
}

export class InsufficientStockError extends AppError {
  constructor(currentStock: number, requestedAmount: number) {
    super(
      `Stok tidak mencukupi. Stok saat ini: ${currentStock}, diminta: ${requestedAmount}`,
      ERROR_CODES.INSUFFICIENT_STOCK,
      409,
    );
  }
}

export class ConcurrencyError extends AppError {
  constructor() {
    super(
      'Gagal, stok baru saja berubah oleh user lain. Silakan coba lagi.',
      ERROR_CODES.CONCURRENCY_ERROR,
      409,
    );
  }
}

export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(errors: Array<{ field: string; message: string }>) {
    super('Invalid request body', ERROR_CODES.VALIDATION_ERROR, 400);
    this.errors = errors;
  }
}
