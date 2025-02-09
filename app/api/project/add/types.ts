import Joi from 'joi';
import { PaymentSchedule, Phase, ProjectPayment, ProjectStatus, ProjectType } from '@prisma/client';
import { PhaseSchema } from '../phases/add/types';

export const ProjectPaymentSchema = Joi.object({
  totalAmount: Joi.number().required(),
  depositRequired: Joi.number().allow(null).optional(),
  depositDueDate: Joi.date().allow(null).optional(),
  paymentSchedule: Joi.string()
    .valid(...Object.values(PaymentSchedule))
    .required(),
  notes: Joi.string().allow('', null).optional()
});

export const AddProjectRequestBodySchema = Joi.object({
  // Project fields at root level
  name: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(),
  type: Joi.string()
    .valid(...Object.values(ProjectType))
    .required(),
  status: Joi.string()
    .valid(...Object.values(ProjectStatus))
    .required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),

  // Client section
  client: Joi.object({
    id: Joi.string().optional(),
    name: Joi.string().min(1).when('id', { is: undefined, then: Joi.required() }),
    email: Joi.string().email().when('id', { is: undefined, then: Joi.required() }),
    phone: Joi.string().min(1).when('id', { is: undefined, then: Joi.required() })
  }).required(),

  // Phases section
  phases: Joi.array().items(PhaseSchema).required(),

  // Payment section
  payment: ProjectPaymentSchema.required()
});

export type AddProjectRequestBody = {
  // Project fields at root level
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;

  // Other sections
  client: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  phases: Phase[];
  payment: ProjectPayment;
};
