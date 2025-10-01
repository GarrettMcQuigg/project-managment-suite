import { ProjectMessageAttachment } from '@prisma/client';
import { createAdminClient } from '../../utils/supabase/client';
import { db } from '../../prisma/client';

export async function refreshSignedUrlForAttachment(attachment: ProjectMessageAttachment): Promise<string> {
  // Signed URLs have a token with expiration info
  // Check if URL will expire in next 7 days
  const urlParams = new URL(attachment.blobUrl).searchParams;
  const expiresAt = urlParams.get('Expires');

  if (expiresAt) {
    const expirationDate = new Date(parseInt(expiresAt) * 1000);
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (expirationDate < sevenDaysFromNow) {
      const supabase = createAdminClient();
      const { data, error } = await supabase.storage.from('blob-storage').createSignedUrl(attachment.pathname, 7776000);

      if (error) {
        throw error;
      }

      await db.projectMessageAttachment.update({
        where: { id: attachment.id },
        data: { blobUrl: data.signedUrl }
      });

      return data.signedUrl;
    }
  }

  return attachment.blobUrl;
}
