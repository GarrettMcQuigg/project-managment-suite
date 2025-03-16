import Joi from 'joi';

export const UpdateProjectPhaseStatusRequestBodySchema = Joi.object({
  projectId: Joi.string().required(),
  phaseId: Joi.string().required(),
  newStatus: Joi.string().required()
});

export type UpdateProjectPhaseStatusRequestBody = {
  projectId?: string;
  phaseId: string;
  newStatus: string;
};
