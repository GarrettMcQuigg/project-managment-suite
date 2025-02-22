import { CalendarEventType } from '@prisma/client';
import { db } from '../prisma/client';

interface MilestoneConfig {
  years: number;
  title: string;
  description: string;
}

const PLATFORM_MILESTONES: MilestoneConfig[] = [
  {
    years: 1,
    title: '1 Year Platform Anniversary',
    description: 'Celebrating one year of creative journey with us!'
  },
  {
    years: 2,
    title: '2 Year Platform Anniversary',
    description: 'Two years of bringing creative visions to life!'
  },
  {
    years: 3,
    title: '3 Year Platform Anniversary',
    description: 'Three years of creative excellence!'
  }
  // Add more milestones as needed
];

const CLIENT_MILESTONES: MilestoneConfig[] = [
  {
    years: 1,
    title: '1 Year Client Anniversary',
    description: 'Celebrating one year of successful collaboration!'
  },
  {
    years: 2,
    title: '2 Year Client Partnership',
    description: 'Two years of amazing projects together!'
  }
  // Add more client milestones
];

export async function generateUpcomingMilestones() {
  // Get all users
  const users = await db.user.findMany({
    where: {
      deletedAt: null
    }
  });

  for (const user of users) {
    // Generate platform milestones
    const userJoinDate = user.createdAt;
    await generatePlatformMilestones(user.id, userJoinDate);

    // Get all active clients for the user
    const clients = await db.client.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
        isArchived: false
      }
    });

    // Generate client milestones for each client
    for (const client of clients) {
      await generateClientMilestones(user.id, client.id, client.createdAt);
    }
  }
}

async function generatePlatformMilestones(userId: string, joinDate: Date) {
  for (const milestone of PLATFORM_MILESTONES) {
    const milestoneDate = new Date(joinDate);
    milestoneDate.setFullYear(milestoneDate.getFullYear() + milestone.years);

    // Only create future milestones
    const today = new Date();

    if (milestoneDate >= today) {
      // Check if milestone already exists
      const existingMilestone = await db.calendarEvent.findFirst({
        where: {
          userId,
          type: CalendarEventType.PLATFORM_MILESTONE,
          startDate: milestoneDate,
          title: milestone.title
        }
      });

      if (!existingMilestone) {
        await db.calendarEvent.create({
          data: {
            userId,
            title: milestone.title,
            description: milestone.description,
            type: CalendarEventType.PLATFORM_MILESTONE,
            startDate: milestoneDate,
            isAllDay: true,
            status: 'SCHEDULED',
            reminders: {
              create: [
                {
                  reminderTime: new Date(milestoneDate.getTime() - 24 * 60 * 60 * 1000),
                  notificationEnabled: true
                }
              ]
            }
          }
        });
      }
    }
  }
}

async function generateClientMilestones(userId: string, clientId: string, relationshipStart: Date) {
  for (const milestone of CLIENT_MILESTONES) {
    const milestoneDate = new Date(relationshipStart);
    milestoneDate.setFullYear(milestoneDate.getFullYear() + milestone.years);

    // Only create future milestones
    const today = new Date();

    if (milestoneDate >= today) {
      // Check if milestone already exists
      const existingMilestone = await db.calendarEvent.findFirst({
        where: {
          userId,
          clientId,
          type: CalendarEventType.PLATFORM_MILESTONE,
          startDate: milestoneDate,
          title: milestone.title
        }
      });

      if (!existingMilestone) {
        await db.calendarEvent.create({
          data: {
            userId,
            clientId,
            title: milestone.title,
            description: milestone.description,
            type: CalendarEventType.PLATFORM_MILESTONE,
            startDate: milestoneDate,
            isAllDay: true,
            status: 'SCHEDULED',
            reminders: {
              create: [
                {
                  reminderTime: new Date(milestoneDate.getTime() - 24 * 60 * 60 * 1000),
                  notificationEnabled: true
                }
              ]
            }
          }
        });
      }
    }
  }
}
