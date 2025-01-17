import Joi from 'joi';

export const SignupRequestBodySchema = Joi.object({
  firstname: Joi.string().min(2).max(30).required(),
  lastname: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[$&+,:;=?@#|'<>.^*()%!-])(?=.*[0-9]).{8,}$/)
    .required()
    .messages({
      'string.pattern.base': '"password" does not meet requirements'
    }),
  emailMFACode: Joi.string().min(6).max(6).required(),
  smsMFACode: Joi.string().min(6).max(6).required()
});

export type SignupRequestBody = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  emailMFACode: string;
  smsMFACode: string;
};
