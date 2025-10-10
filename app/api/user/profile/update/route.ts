import { db } from '@packages/lib/prisma/client';
import { createAdminClient } from '@/packages/lib/utils/supabase/client';
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

    let profileImgUrl: string | undefined;
    let coverImgUrl: string | undefined;

    const supabase = await createAdminClient();

    const profileImg = formData.get('profileImg') as File | null;
    if (profileImg) {
      try {
        const filePath = `profile-images/${currentUser.id}-${profileImg.name}`;
        const fileBuffer = await profileImg.arrayBuffer();

        const { error: storageError } = await supabase.storage.from('blob-storage').upload(filePath, fileBuffer, {
          contentType: profileImg.type,
          upsert: true
        });

        if (storageError) {
          throw storageError;
        }

        // Generate a signed URL valid for 90 days
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('blob-storage').createSignedUrl(filePath, 7776000); // 90 days in seconds

        if (signedUrlError) {
          throw signedUrlError;
        }

        profileImgUrl = signedUrlData.signedUrl;
      } catch (error) {
        console.error('Error uploading profile image:', error);
      }
    }

    const coverImg = formData.get('coverImg') as File | null;
    if (coverImg) {
      try {
        const filePath = `cover-images/${currentUser.id}-${coverImg.name}`;
        const fileBuffer = await coverImg.arrayBuffer();

        const { error: storageError } = await supabase.storage.from('blob-storage').upload(filePath, fileBuffer, {
          contentType: coverImg.type,
          upsert: true
        });

        if (storageError) {
          throw storageError;
        }

        // Generate a signed URL valid for 90 days
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('blob-storage').createSignedUrl(filePath, 7776000); // 90 days in seconds

        if (signedUrlError) {
          throw signedUrlError;
        }

        coverImgUrl = signedUrlData.signedUrl;
      } catch (error) {
        console.error('Error uploading cover image:', error);
      }
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
        profileImg: profileImgUrl ?? undefined,
        coverImg: coverImgUrl ?? undefined
      }
    });

    return handleSuccess({ message: 'Account info successfully updated!' });
  } catch (err: unknown) {
    return handleError({ message: 'Failed to update account info.', err });
  }
}
