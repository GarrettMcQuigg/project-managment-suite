import Joi from 'joi';
import { PaymentSchedule, Phase, ProjectPayment, ProjectStatus, ProjectType } from '@prisma/client';
import { PhaseSchema } from '../phases/add/types';

export const UpdateProjectPaymentSchema = Joi.object({
  totalAmount: Joi.number().required(),
  depositRequired: Joi.number().required(),
  depositDueDate: Joi.date().allow(null),
  paymentSchedule: Joi.string()
    .valid(...Object.values(PaymentSchedule))
    .required(),
  notes: Joi.string().allow('')
});

export const UpdateProjectRequestBodySchema = Joi.object({
  id: Joi.string().required(),

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

  client: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(1).required()
  }).required(),

  phases: Joi.array().items(PhaseSchema).required(),

  payment: UpdateProjectPaymentSchema.required()
});

export type UpdateProjectRequestBody = {
  id: string;

  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;

  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  phases: Phase[];
  payment: {
    totalAmount: number;
    depositRequired: number;
    paymentSchedule: PaymentSchedule;
  };
};

export type UpdateProjectResponse = {
  message: string;
  content: {
    id: string;
    name: string;
    description: string;
    type: ProjectType;
    status: ProjectStatus;
    startDate: Date;
    endDate: Date;
    client: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    phases: Phase[];
    payment: ProjectPayment;
    createdAt: Date;
    updatedAt: Date;
  };
};
