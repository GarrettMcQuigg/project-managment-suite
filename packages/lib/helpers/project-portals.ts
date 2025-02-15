export function generateSecurePassword(): string {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '@#$%&*!?';

  const getRandomChars = (charSet: string, count: number) => {
    return Array.from({ length: count }, () => charSet[Math.floor(Math.random() * charSet.length)]).join('');
  };

  const parts = [getRandomChars(upperChars, 2), getRandomChars(numbers, 2), getRandomChars(lowerChars, 2), getRandomChars(specialChars, 2)];

  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts.join('');
}

export function generatePortalSlug(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  const randomString = Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');

  return randomString;
}
