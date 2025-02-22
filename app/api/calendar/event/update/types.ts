import { CalendarEventStatus, CalendarEventType } from '@prisma/client';
import { Reminder } from '../add/types';
import Joi from 'joi';

export const UpdateCalendarEventRequestBodySchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  startDate: Joi.date().required(),
  endDate: Joi.date().allow(null),
  isAllDay: Joi.boolean().required(),
  type: Joi.string()
    .valid(...Object.values(CalendarEventType))
    .required(),
  status: Joi.string()
    .valid(...Object.values(CalendarEventStatus))
    .required(),
  color: Joi.string().allow('', null),
  projectId: Joi.string().allow('', null),
  phaseId: Joi.string().allow('', null),
  invoiceId: Joi.string().allow('', null),
  clientId: Joi.string().allow('', null),
  reminders: Joi.array().items(
    Joi.object({
      reminderTime: Joi.date().required(),
      emailEnabled: Joi.boolean().required(),
      phoneEnabled: Joi.boolean().required(),
      notificationEnabled: Joi.boolean().required()
    })
  )
});

export interface UpdateCalendarEventRequestBody {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isAllDay: boolean;
  type: CalendarEventType;
  status: CalendarEventStatus;
  color?: string;
  projectId?: string;
  phaseId?: string;
  invoiceId?: string;
  clientId?: string;
  reminders: Reminder[];
}

export interface UpdateCalendarEventResponse {
  success: boolean;
  error?: string;
  data?: {
    id: string;
  };
}
