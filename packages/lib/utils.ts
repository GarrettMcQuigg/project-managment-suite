import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export function slugify(text: string) {
  return text
    .toString() // Convert to string
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase() // Convert to lowercase
    .trim() // Trim whitespace
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
}

export function formatNumberWithAbbreviation(num: number): string {
  if (num < 1000) {
    return num.toString();
  }

  const units = ['', 'K', 'M'];
  const unitIndex = Math.floor(Math.log10(num) / 3);
  const value = num / Math.pow(1000, unitIndex);

  const unit = units[unitIndex];

  if (!unit) {
    return num.toString();
  }

  if (value >= 100) {
    return Math.floor(value) + unit;
  } else {
    return value.toFixed(1).replace(/\.0$/, '') + units[unitIndex];
  }
}
