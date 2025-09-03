import { db } from '../prisma/client';

export async function CheckEmailAvailability(email: string): Promise<boolean> {
  try {
    const existingUser = await db.user.findUnique({
      where: {
        email: email
      }
    });

    return !existingUser; // true if email is available (no existing user)
  } catch (error) {
    console.error('Error checking email availability:', error);
    return false;
  }
}
