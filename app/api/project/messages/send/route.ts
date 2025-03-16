import { handleBadRequest, handleNotFound, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { PortalVisitor } from '@/packages/lib/helpers/get-portal-user';
import { db } from '@/packages/lib/prisma/client';
import { getSessionContext } from '@/packages/lib/utils/auth/get-session-context';
import { User } from '@prisma/client';
import { NextResponse } from 'next/server';
import { SendProjectMessageRequestBody, SendProjectMessageRequestBodySchema } from './types';

export async function POST(request: Request) {
  try {
    const context = await getSessionContext();

    let currentUser: User | PortalVisitor | null = null;
    if (context.type === 'user') {
      currentUser = context.user as User;
    } else if (context.type === 'portal') {
      currentUser = context.visitor as PortalVisitor;
    }

    if (!currentUser) {
      return handleUnauthorized();
    }

    const requestBody: SendProjectMessageRequestBody = await request.json();
    const { projectId, text } = requestBody;

    const { error } = SendProjectMessageRequestBodySchema.validate(requestBody);
    if (error) {
      return handleBadRequest({ message: error.message, err: error });
    }

    if (!projectId || !text) {
      return handleBadRequest();
    }

    const project = await db.project.findUnique({
      where: {
        id: projectId
      },
      include: {
        participants: true
      }
    });

    if (!project) {
      return handleBadRequest();
    }

    let newMessage;

    if (context.type === 'user') {
      const userDetails = await db.user.findUnique({
        where: {
          id: (currentUser as User).id
        },
        select: {
          firstname: true,
          lastname: true,
          email: true
        }
      });

      if (!userDetails) {
        return handleNotFound();
      }

      newMessage = await db.projectMessage.create({
        data: {
          projectId: projectId,
          sender: `${userDetails.firstname} ${userDetails.lastname}`,
          text: text
        }
      });
    } else if (context.type === 'portal') {
      const portalVisitor = currentUser as PortalVisitor;

      newMessage = await db.projectMessage.create({
        data: {
          projectId: projectId,
          sender: portalVisitor.name,
          text: text
        }
      });
    }

    if (!newMessage) {
      return handleBadRequest();
    }

    return handleSuccess({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error adding project message:', error);
    return NextResponse.json({ err: 'Internal server error' }, { status: 500 });
  }
}
