import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface UrlValidationResult {
  valid: boolean;
  normalized?: string;
  error?: string;
}

export function normalizeAndValidateUrl(input: string): UrlValidationResult {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, error: 'Please enter a website URL.' };

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname.includes('.')) {
      return { valid: false, error: 'Please enter a valid website URL (e.g. acmecompany.com).' };
    }
    return { valid: true, normalized: parsed.toString() };
  } catch {
    return { valid: false, error: "That doesn't look like a valid URL." };
  }
}
