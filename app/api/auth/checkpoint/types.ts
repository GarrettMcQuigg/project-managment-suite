import Joi from 'joi';

export const AuthCheckpointRequestBodySchema = Joi.object({
  email: Joi.string().email().required()
});

export type AuthCheckpointRequestBody = {
  email: string;
};
