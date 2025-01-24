import { ProjectStatus, ProjectType } from '@prisma/client';
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

export type ProjectCreateRequestBody = {
  client: {
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
