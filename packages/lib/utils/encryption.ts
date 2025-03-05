import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_IV = process.env.ENCRYPTION_IV;

export async function encrypt(text: string): Promise<string> {
  if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
    throw new Error('Encryption key or IV is missing');
  }

  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(ENCRYPTION_IV, 'hex');

    if (key.length !== 32) {
      throw new Error(`Invalid key length: ${key.length} bytes. Expected 32 bytes.`);
    }

    if (iv.length !== 16) {
      throw new Error(`Invalid IV length: ${iv.length} bytes. Expected 16 bytes.`);
    }

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

export function decrypt(encrypted: string): string {
  if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
    throw new Error('Encryption key or IV is missing');
  }

  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(ENCRYPTION_IV, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}
