import { Prisma } from '@prisma/client';

export type ClientWithMetadata = Prisma.ClientGetPayload<{
  include: { projects: true };
}>;

export type ProjectWithMetadata = Prisma.ProjectGetPayload<{
  include: { client: true; payment: true; phases: true };
}>;
