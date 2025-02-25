import Joi from 'joi';

export const AddInvoiceRequestBodySchema = Joi.object({
  project: Joi.string().optional(),
  invoiceNumber: Joi.string().required(),
  type: Joi.string().required(),
  status: Joi.string().required(),
  dueDate: Joi.date().required(),
  notes: Joi.string().allow('', null).optional(),
  paymentMethod: Joi.string().allow('', null).optional(),
  amount: Joi.string().required()
});

export type AddInvoiceRequestBody = {
  project?: string;
  invoiceNumber: string;
  type: string;
  status: string;
  dueDate: Date;
  notes?: string;
  paymentMethod?: string;
  amount: string;
};
