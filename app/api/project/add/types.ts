import { ProjectStatus, ProjectType } from '@prisma/client';
import Joi from 'joi';

export const AddProjectRequestBodySchema = Joi.object({
  client: Joi.object({
    id: Joi.string().optional(),
    name: Joi.string().min(1).when('id', { is: undefined, then: Joi.required() }),
    email: Joi.string().email().when('id', { is: undefined, then: Joi.required() }),
    phone: Joi.string().min(1).when('id', { is: undefined, then: Joi.required() })
  }).required(),
  project: Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string().min(1).required(),
    type: Joi.string()
      .valid(...Object.values(ProjectType))
      .required(),
    status: Joi.string()
      .valid(...Object.values(ProjectStatus))
      .required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required()
  }).required()
});

export type AddProjectRequestBody = {
  client?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  project: {
    name: string;
    description: string;
    type: ProjectType;
    status: ProjectStatus;
    startDate: Date;
    endDate: Date;
    // phases: {
    //   type: PhaseType;
    //   name: string;
    //   description?: string;
    //   startDate: Date;
    //   endDate: Date;
    // }[];
  };
};
