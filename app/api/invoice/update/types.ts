import Joi from 'joi';

export const UpdateInvoiceRequestBodySchema = Joi.object({
  id: Joi.string().required(),
  // project: Joi.string().optional(),
  invoiceNumber: Joi.string().required(),
  type: Joi.string().required(),
  status: Joi.string().required(),
  dueDate: Joi.date().required(),
  notes: Joi.string().allow('', null).optional(),
  amount: Joi.string().required(),
  client: Joi.object({
    id: Joi.string().optional(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required()
  }).optional()
});

export type UpdateInvoiceRequestBody = {
  id: string;
  // project?: string;
  invoiceNumber: string;
  type: string;
  status: string;
  dueDate: Date;
  notes?: string;
  amount: string;
  client?: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
};
