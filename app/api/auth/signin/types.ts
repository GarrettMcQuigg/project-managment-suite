import Joi from 'joi';

export const SigninRequestBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required(),
  smsMFACode: Joi.string().min(0).max(10)
});

export type SigninRequestBody = {
  email: string;
  password: string;
  smsMFACode: string;
};
