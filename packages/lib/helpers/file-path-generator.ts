/**
 * Generates a random alphanumeric string of specified length
 */
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Extracts the file extension from a filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.substring(lastDot);
}

/**
 * Sanitizes a filename by removing special characters and spaces
 */
function sanitizeFilename(filename: string): string {
  // Remove extension temporarily
  const ext = getFileExtension(filename);
  const nameWithoutExt = ext ? filename.slice(0, -ext.length) : filename;

  // Replace spaces and special chars with hyphens, remove multiple hyphens
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return sanitized + ext;
}

/**
 * Generates a clean file path for project checkpoint message attachments
 * Format: project-checkpoint-messages/{filename}-{randomString}.{ext}
 *
 * @param originalFilename - The original filename from the uploaded file
 * @param randomStringLength - Length of random string to append (default: 6)
 * @returns Clean file path string
 *
 * @example
 * generateCheckpointMessageFilePath('My Document.pdf')
 * // Returns: 'project-checkpoint-messages/my-document-a3b9k2.pdf'
 */
export function generateCheckpointMessageFilePath(
  originalFilename: string,
  randomStringLength: number = 6
): string {
  const sanitized = sanitizeFilename(originalFilename);
  const randomStr = generateRandomString(randomStringLength);
  const ext = getFileExtension(sanitized);
  const nameWithoutExt = ext ? sanitized.slice(0, -ext.length) : sanitized;

  return `project-checkpoint-messages/${nameWithoutExt}-${randomStr}${ext}`;
}

/**
 * Generates a clean file path for project message attachments
 * Format: project-messages/{filename}-{randomString}.{ext}
 *
 * @param originalFilename - The original filename from the uploaded file
 * @param randomStringLength - Length of random string to append (default: 6)
 * @returns Clean file path string
 *
 * @example
 * generateProjectMessageFilePath('Screenshot 2024.png')
 * // Returns: 'project-messages/screenshot-2024-x7y2m9.png'
 */
export function generateProjectMessageFilePath(
  originalFilename: string,
  randomStringLength: number = 6
): string {
  const sanitized = sanitizeFilename(originalFilename);
  const randomStr = generateRandomString(randomStringLength);
  const ext = getFileExtension(sanitized);
  const nameWithoutExt = ext ? sanitized.slice(0, -ext.length) : sanitized;

  return `project-messages/${nameWithoutExt}-${randomStr}${ext}`;
}

/**
 * Extracts the original filename from a generated file path
 * Removes the random string suffix to get back the original name
 *
 * @param filePath - The generated file path
 * @returns Original filename without random suffix
 *
 * @example
 * extractOriginalFilename('project-messages/my-document-a3b9k2.pdf')
 * // Returns: 'my-document.pdf'
 */
export function extractOriginalFilename(filePath: string): string {
  // Get just the filename from the path
  const filename = filePath.split('/').pop() || filePath;

  // Get extension
  const ext = getFileExtension(filename);
  const nameWithoutExt = ext ? filename.slice(0, -ext.length) : filename;

  // Remove the last segment after hyphen (the random string)
  const parts = nameWithoutExt.split('-');
  if (parts.length > 1) {
    // Remove last part (random string)
    parts.pop();
    return parts.join('-') + ext;
  }

  return filename;
}
