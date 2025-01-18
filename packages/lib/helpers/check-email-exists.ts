import { db } from '@/packages/lib/prisma/client';

export async function checkEmailExists(email: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true }
  });

  return user !== null;
}
