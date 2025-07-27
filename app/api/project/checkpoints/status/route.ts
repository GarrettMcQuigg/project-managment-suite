import { NextResponse } from 'next/server';
import { CheckpointStatus } from '@prisma/client';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { handleBadRequest, handleNotFound, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { db } from '@/packages/lib/prisma/client';
import { UpdateProjectCheckpointStatusRequestBody, UpdateProjectCheckpointStatusRequestBodySchema } from './types';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return handleUnauthorized();
    }

    const requestBody: UpdateProjectCheckpointStatusRequestBody = await request.json();
    const { projectId, checkpointId, newStatus } = requestBody;

    const { error } = UpdateProjectCheckpointStatusRequestBodySchema.validate(requestBody);
    if (error) {
      return handleBadRequest({ message: error.message, err: error });
    }

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId: currentUser.id
      },
      include: {
        checkpoints: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!project) {
      return handleNotFound();
    }

    // Find the current checkpoint index
    const checkpointIndex = project.checkpoints.findIndex((p) => p.id === checkpointId);
    if (checkpointIndex === -1) {
      return handleBadRequest();
    }

    const currentCheckpoint = project.checkpoints[checkpointIndex];
    const isMarkingAsCompleted = newStatus === CheckpointStatus.COMPLETED;
    const updatedCheckpoints = [];

    if (isMarkingAsCompleted) {
      // Mark current checkpoint as COMPLETED
      updatedCheckpoints.push({
        id: currentCheckpoint.id,
        status: CheckpointStatus.COMPLETED
      });

      // Ensure all previous checkpoints are also marked as COMPLETED
      for (let i = 0; i < checkpointIndex; i++) {
        updatedCheckpoints.push({
          id: project.checkpoints[i].id,
          status: CheckpointStatus.COMPLETED
        });
      }

      // Set next checkpoint (if exists) to IN_PROGRESS
      if (checkpointIndex + 1 < project.checkpoints.length) {
        updatedCheckpoints.push({
          id: project.checkpoints[checkpointIndex + 1].id,
          status: CheckpointStatus.IN_PROGRESS
        });
      }
    } else {
      // If marking as incomplete, set current to IN_PROGRESS
      updatedCheckpoints.push({
        id: currentCheckpoint.id,
        status: CheckpointStatus.IN_PROGRESS
      });

      // Set all subsequent checkpoints to PENDING
      for (let i = checkpointIndex + 1; i < project.checkpoints.length; i++) {
        updatedCheckpoints.push({
          id: project.checkpoints[i].id,
          status: CheckpointStatus.PENDING
        });
      }
    }

    // Update all checkpoints in a transaction
    await db.$transaction(
      updatedCheckpoints.map((checkpoint) =>
        db.checkpoint.update({
          where: { id: checkpoint.id },
          data: { status: checkpoint.status }
        })
      )
    );

    return handleSuccess({ message: 'Checkpoint status updated successfully' });
  } catch (error) {
    console.error('Error updating checkpoint status:', error);
    return NextResponse.json({ err: 'Internal server error' }, { status: 500 });
  }
}
