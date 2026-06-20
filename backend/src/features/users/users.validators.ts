import type { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

const ALLOWED_UPDATE_FIELDS = [
  'name',
  'college',
  'homeCity',
  'profilePhotoUrl',
];

export const validateUpdateProfile = [
  body().custom((_value, { req }) => {
    const keys = Object.keys(req.body);
    const blocked = keys.filter(k => !ALLOWED_UPDATE_FIELDS.includes(k));
    if (blocked.length > 0) {
      throw new Error(`Cannot update restricted fields: ${blocked.join(', ')}`);
    }
    return true;
  }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.array()[0].msg,
        },
      });
      return;
    }
    next();
  },
];
