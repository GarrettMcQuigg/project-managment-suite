import Joi from 'joi';

export const ClientRequestBodySchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional()
});

export type ClientRequestBody = {
  name: string;
  email?: string;
  phone?: string;
};
