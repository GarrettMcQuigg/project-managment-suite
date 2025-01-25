import Joi from 'joi';

export const GetClientByIdRequestBodySchema = Joi.object({
  id: Joi.string().required()
});

export type GetClientByIdRequestBody = {
  id: string;
};
