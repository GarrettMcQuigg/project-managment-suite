import Joi from 'joi';

export const SignupAvailabilityEmailRequestBodySchema = Joi.object({
  email: Joi.string().email().required()
});

export type SignupAvailabilityEmailRequestBody = {
  email: string;
};
