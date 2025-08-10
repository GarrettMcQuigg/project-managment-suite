import { NextResponse } from 'next/server';
import { Checkpoint, CheckpointStatus, ProjectStatus } from '@prisma/client';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { handleBadRequest, handleNotFound, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { db } from '@/packages/lib/prisma/client';
import { UpdateProjectCheckpointStatusRequestBody, UpdateProjectCheckpointStatusRequestBodySchema } from './types';

// Determine project status based on checkpoint completion
function determineProjectStatus(checkpoints: Checkpoint[]): ProjectStatus {
  const totalCheckpoints = checkpoints.length;
  const completedCheckpoints = checkpoints.filter((cp) => cp.status === CheckpointStatus.COMPLETED).length;

  // If no checkpoints, keep current status
  if (totalCheckpoints === 0) {
    return ProjectStatus.PREPARATION;
  }

  // If all checkpoints are completed, project is completed
  if (completedCheckpoints === totalCheckpoints) {
    return ProjectStatus.COMPLETED;
  }

  // If no checkpoints are completed, check the first checkpoint type
  if (completedCheckpoints === 0) {
    const firstCheckpoint = checkpoints.find((cp) => cp.order === 1);
    if (firstCheckpoint && firstCheckpoint.type === 'PREPARATION') {
      return ProjectStatus.PREPARATION;
    }
    // If first checkpoint is not PREPARATION or COMPLETED, start as ACTIVE
    return ProjectStatus.ACTIVE;
  }

  // If some checkpoints are completed but not all, project is ACTIVE
  return ProjectStatus.ACTIVE;
}

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
    const updatedCheckpoints: { id: string; status: CheckpointStatus }[] = [];

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

    // Update all checkpoints in a transaction and update project status
    await db.$transaction(async (tx) => {
      // Update checkpoints
      await Promise.all(
        updatedCheckpoints.map((checkpoint) =>
          tx.checkpoint.update({
            where: { id: checkpoint.id },
            data: { status: checkpoint.status }
          })
        )
      );

      // Calculate new project status based on checkpoint completion
      const updatedCheckpointsWithStatus = project.checkpoints.map((cp) => {
        const updatedCheckpoint = updatedCheckpoints.find((ucp) => ucp.id === cp.id);
        return {
          ...cp,
          status: updatedCheckpoint ? updatedCheckpoint.status : cp.status
        };
      });

      const newProjectStatus = determineProjectStatus(updatedCheckpointsWithStatus);

      await tx.project.update({
        where: { id: projectId },
        data: { status: newProjectStatus }
      });
    });

    return handleSuccess({ message: 'Checkpoint status updated successfully' });
  } catch (error) {
    console.error('Error updating checkpoint status:', error);
    return NextResponse.json({ err: 'Internal server error' }, { status: 500 });
  }
}
