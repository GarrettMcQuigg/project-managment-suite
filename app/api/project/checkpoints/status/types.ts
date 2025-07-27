import Joi from 'joi';

export const UpdateProjectCheckpointStatusRequestBodySchema = Joi.object({
  projectId: Joi.string().required(),
  checkpointId: Joi.string().required(),
  newStatus: Joi.string().required()
});

export type UpdateProjectCheckpointStatusRequestBody = {
  projectId?: string;
  checkpointId: string;
  newStatus: string;
};
