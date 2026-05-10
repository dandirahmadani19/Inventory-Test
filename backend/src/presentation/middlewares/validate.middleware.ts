import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../../application/errors/app.error';

/**
 * Factory that returns a middleware validating req.body against the given Zod schema.
 * On failure, throws ValidationError which the error-handler converts to 400.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new ValidationError(errors));
      } else {
        next(err);
      }
    }
  };
}
