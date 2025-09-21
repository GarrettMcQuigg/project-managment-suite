import Joi from 'joi';

export const SendCheckpointMessageRequestBodySchema = Joi.object({
  projectId: Joi.string().required(),
  checkpointId: Joi.string().required(),
  text: Joi.string().optional().allow('')
});

export type SendCheckpointMessageRequestBody = {
  projectId: string;
  checkpointId: string;
  text?: string;
};