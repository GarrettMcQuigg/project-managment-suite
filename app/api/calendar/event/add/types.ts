import { CalendarEventStatus, CalendarEventType } from '@prisma/client';

export interface Reminder {
  reminderTime: string;
  emailEnabled: boolean;
  phoneEnabled: boolean;
  notificationEnabled: boolean;
}

export interface AddCalendarEventRequestBody {
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

export interface AddCalendarEventResponse {
  success: boolean;
  error?: string;
  data?: {
    id: string;
  };
}
