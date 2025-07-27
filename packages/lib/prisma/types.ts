import { Prisma } from '@prisma/client';

export type UserWithMetadata = Prisma.UserGetPayload<{
  include: { 
    projects: true;
    subscription: true; 
    analytics: {
      include: {
        communicationAnalytics: true
      }
    }; 
    calendarEvent: true; 
    userActivity: true; 
    pageView: true 
  };
}>;

export type ClientWithMetadata = Prisma.ClientGetPayload<{
  include: { projects: true };
}>;

export type ProjectWithMetadata = Prisma.ProjectGetPayload<{
  include: { client: true; invoices: true; checkpoints: true; portalViews: true; attachments: true; messages: true; };
}>;

export type CalendarEventWithMetadata = Prisma.CalendarEventGetPayload<{
  include: { project: true; reminders: true };
}>;

export type InvoiceWithMetadata = Prisma.InvoiceGetPayload<{
  include: { project: true; payments: true; checkpoint: true };
}>;

export type AnalyticsWithMetadata = Prisma.AnalyticsGetPayload<{
  include: { communicationAnalytics: true };
}>;
