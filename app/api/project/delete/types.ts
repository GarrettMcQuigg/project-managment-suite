import Joi from 'joi';

export const DeleteProjectRequestBodySchema = Joi.object({
  id: Joi.string().required()
});

export type DeleteProjectRequestBody = {
  id: string;
};
