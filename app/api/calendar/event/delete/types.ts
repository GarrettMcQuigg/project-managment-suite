import Joi from 'joi';

export const DeleteCalendarEventRequestBodySchema = Joi.object({
  id: Joi.string().required()
});

export interface DeleteCalendarEventRequestBody {
  id: string;
}
