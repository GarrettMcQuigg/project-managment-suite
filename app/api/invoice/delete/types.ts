import Joi from 'joi';

export const DeleteInvoiceRequestBodySchema = Joi.object({
  id: Joi.string().required()
});

export type DeleteInvoiceRequestBody = {
  id: string;
};
