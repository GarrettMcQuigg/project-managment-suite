import Joi from 'joi';
import { Phase, ProjectStatus, ProjectType, InvoiceStatus, InvoiceType } from '@prisma/client';
import { PhaseSchema } from '../phases/add/types';

export const NewInvoiceSchema = Joi.object({
  invoiceNumber: Joi.string().required(),
  type: Joi.string()
    .valid(...Object.values(InvoiceType))
    .required(),
  amount: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
  status: Joi.string()
    .valid(...Object.values(InvoiceStatus))
    .required(),
  dueDate: Joi.date().required(),
  notes: Joi.string().allow('', null),
  phaseId: Joi.string().allow(null),
  id: Joi.string().optional(),
  projectId: Joi.string().allow('').optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
});

export const AddProjectRequestBodySchema = Joi.object({
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
    id: Joi.string().allow('').optional(),
    name: Joi.string().min(1).when('id', { is: '', then: Joi.required() }),
    email: Joi.string().email().when('id', { is: '', then: Joi.required() }),
    phone: Joi.string().min(1).when('id', { is: '', then: Joi.required() })
  }).required(),

  phases: Joi.array().items(PhaseSchema).required(),
  invoices: Joi.array().items(NewInvoiceSchema).required()
});

type NewInvoiceData = {
  id?: string;
  projectId?: string;
  invoiceNumber: string;
  type: InvoiceType;
  amount: string | number;
  status: InvoiceStatus;
  dueDate: Date;
  notes?: string | null;
  phaseId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AddProjectRequestBody = {
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  client: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  phases: Phase[];
  invoices: NewInvoiceData[];
};
