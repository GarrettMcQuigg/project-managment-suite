import Joi from 'joi';

export const SendProjectMessageRequestBodySchema = Joi.object({
  projectId: Joi.string().required(),
  text: Joi.string().required()
});

export type SendProjectMessageRequestBody = {
  projectId?: string;
  text: string;
};
