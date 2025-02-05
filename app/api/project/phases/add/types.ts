import Joi from 'joi';
import { PhaseType, PhaseStatus } from '@prisma/client';

export const PhaseSchema = Joi.object({
  id: Joi.string().optional(),
  projectId: Joi.string().allow(''),
  type: Joi.string()
    .valid(...Object.values(PhaseType))
    .required(),
  name: Joi.string().allow(''),
  description: Joi.string().allow(''),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  status: Joi.string()
    .valid(...Object.values(PhaseStatus))
    .default('PENDING'),
  order: Joi.number().required(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
}).unknown(true);
