import Joi from 'joi';

export const AddClientRequestBodySchema = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-\.\']+$/) // Allow letters, numbers, spaces, hyphens, dots, apostrophes
    .messages({
      'string.pattern.base': 'Name contains invalid characters',
      'string.max': 'Name must be less than 100 characters',
      'string.min': 'Name is required'
    }),
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .max(254) // RFC 5321 limit
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email must be less than 254 characters'
    }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/) // E.164 format
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be in valid international format'
    })
});

export type AddClientRequestBody = {
  name: string;
  email?: string;
  phone?: string;
};
