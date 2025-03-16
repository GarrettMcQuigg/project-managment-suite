import { NextResponse } from 'next/server';
import { PhaseStatus } from '@prisma/client';
import { getCurrentUser } from '@/packages/lib/helpers/get-current-user';
import { handleBadRequest, handleSuccess, handleUnauthorized } from '@/packages/lib/helpers/api-response-handlers';
import { db } from '@/packages/lib/prisma/client';
import { UpdateProjectPhaseStatusRequestBody, UpdateProjectPhaseStatusRequestBodySchema } from './types';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return handleUnauthorized();
    }

    const requestBody: UpdateProjectPhaseStatusRequestBody = await request.json();
    const { projectId, phaseId, newStatus } = requestBody;

    const { error } = UpdateProjectPhaseStatusRequestBodySchema.validate(requestBody);
    if (error) {
      return handleBadRequest({ message: error.message, err: error });
    }

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId: currentUser.id
      },
      include: {
        phases: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!project) {
      return handleUnauthorized();
    }

    // Find the current phase index
    const phaseIndex = project.phases.findIndex((p) => p.id === phaseId);
    if (phaseIndex === -1) {
      return handleBadRequest();
    }

    const currentPhase = project.phases[phaseIndex];
    const isMarkingAsCompleted = newStatus === PhaseStatus.COMPLETED;
    const updatedPhases = [];

    if (isMarkingAsCompleted) {
      // Mark current phase as COMPLETED
      updatedPhases.push({
        id: currentPhase.id,
        status: PhaseStatus.COMPLETED
      });

      // Ensure all previous phases are also marked as COMPLETED
      for (let i = 0; i < phaseIndex; i++) {
        updatedPhases.push({
          id: project.phases[i].id,
          status: PhaseStatus.COMPLETED
        });
      }

      // Set next phase (if exists) to IN_PROGRESS
      if (phaseIndex + 1 < project.phases.length) {
        updatedPhases.push({
          id: project.phases[phaseIndex + 1].id,
          status: PhaseStatus.IN_PROGRESS
        });
      }
    } else {
      // If marking as incomplete, set current to IN_PROGRESS
      updatedPhases.push({
        id: currentPhase.id,
        status: PhaseStatus.IN_PROGRESS
      });

      // Set all subsequent phases to PENDING
      for (let i = phaseIndex + 1; i < project.phases.length; i++) {
        updatedPhases.push({
          id: project.phases[i].id,
          status: PhaseStatus.PENDING
        });
      }
    }

    // Update all phases in a transaction
    await db.$transaction(
      updatedPhases.map((phase) =>
        db.phase.update({
          where: { id: phase.id },
          data: { status: phase.status }
        })
      )
    );

    return handleSuccess({ message: 'Phase status updated successfully' });
  } catch (error) {
    console.error('Error updating phase status:', error);
    return NextResponse.json({ err: 'Internal server error' }, { status: 500 });
  }
}
