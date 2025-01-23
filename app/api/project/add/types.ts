import { ProjectType } from '@prisma/client';
import Joi from 'joi';

export const ProjectRequestBodySchema = Joi.object({
  clientId: Joi.string().required(),
  type: Joi.string()
    .valid(...Object.values(ProjectType))
    .required(),
  name: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required()
});

export type ProjectRequestBody = {
  clientId: string;
  type: ProjectType;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
};
