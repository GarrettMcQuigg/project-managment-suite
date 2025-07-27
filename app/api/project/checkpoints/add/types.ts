import Joi from 'joi';
import { CheckpointType, CheckpointStatus } from '@prisma/client';

export const CheckpointSchema = Joi.object({
  id: Joi.string().optional(),
  projectId: Joi.string().allow(''),
  type: Joi.string()
    .valid(...Object.values(CheckpointType))
    .required(),
  name: Joi.string().allow(''),
  description: Joi.string().allow(''),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  status: Joi.string()
    .valid(...Object.values(CheckpointStatus))
    .default('PENDING'),
  order: Joi.number().required(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
}).unknown(true);
