import Joi from 'joi';
import { Phase, ProjectStatus, ProjectType, InvoiceStatus, InvoiceType } from '@prisma/client';
import { PhaseSchema } from '../phases/add/types';

export const PhaseSchemaExtended = PhaseSchema.keys({
  isModified: Joi.boolean().optional()
});

export const UpdateInvoiceSchema = Joi.object({
  id: Joi.string().required(),
  invoiceNumber: Joi.string().required(),
  type: Joi.string()
    .valid(...Object.values(InvoiceType))
    .required(),
  amount: Joi.number().required(),
  status: Joi.string()
    .valid(...Object.values(InvoiceStatus))
    .required(),
  dueDate: Joi.date().required(),
  notes: Joi.string().allow('', null),
  phaseId: Joi.string().allow(null)
}).unknown(true);

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

  phases: Joi.array().items(PhaseSchemaExtended).required(),
  invoices: Joi.array().items(UpdateInvoiceSchema).required()
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
  invoices: {
    id: string;
    invoiceNumber: string;
    type: InvoiceType;
    amount: number;
    status: InvoiceStatus;
    dueDate: Date;
    notes?: string | null;
    phaseId?: string | null;
  }[];
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
    invoices: {
      id: string;
      invoiceNumber: string;
      type: InvoiceType;
      amount: number;
      status: InvoiceStatus;
      dueDate: Date;
      notes?: string | null;
      phaseId?: string | null;
    }[];
    createdAt: Date;
    updatedAt: Date;
  };
};
