import Joi from 'joi';

export const SignupAvailabilityPhoneRequestBodySchema = Joi.object({
  phone: Joi.string().required()
});

export type SignupAvailabilityPhoneRequestBody = {
  phone: string;
};
