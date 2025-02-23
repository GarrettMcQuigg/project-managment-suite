import { db } from '@packages/lib/prisma/client';
import { put } from '@vercel/blob';
import { getCurrentUser } from '@packages/lib/helpers/get-current-user';
import { handleError, handleSuccess, handleUnauthorized } from '@packages/lib/helpers/api-response-handlers';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return handleUnauthorized();
    }

    const formData = await request.formData();
    const firstname = formData.get('firstname') as string;
    const lastname = formData.get('lastname') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const location = formData.get('location') as string;
    const bio = formData.get('bio') as string;

    let profileImgBlob, coverImgBlob;

    const profileImg = formData.get('profileImg') as File | null;
    if (profileImg) {
      profileImgBlob = await put(`profile-${currentUser.id}-${profileImg.name}`, profileImg, { access: 'public' });
    }

    const coverImg = formData.get('coverImg') as File | null;
    if (coverImg) {
      coverImgBlob = await put(`cover-${currentUser.id}-${coverImg.name}`, coverImg, { access: 'public' });
    }

    await db.user.update({
      where: { id: currentUser.id },
      data: {
        firstname,
        lastname,
        email,
        phone,
        dateOfBirth,
        location,
        bio,
        profileImg: profileImgBlob?.url ?? undefined,
        coverImg: coverImgBlob?.url ?? undefined
      }
    });

    return handleSuccess({ message: 'Account info successfully updated!' });
  } catch (err: any) {
    return handleError({ message: 'Failed to update account info.', err });
  }
}
