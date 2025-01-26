import Joi from 'joi';

export const UpdateClientRequestBodySchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional()
});

export type UpdateClientRequestBody = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};
