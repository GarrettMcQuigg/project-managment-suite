import Joi from 'joi';

export const DeleteClientRequestBodySchema = Joi.object({
  id: Joi.string().required()
});

export type DeleteClientRequestBody = {
  id: string;
};
