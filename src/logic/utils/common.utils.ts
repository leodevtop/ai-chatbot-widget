import { Role } from '~/types/chat.js';

export const ROLES: Role[] = Object.values(Role);

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && ROLES.includes(value as Role);
}

/**
 * Sanitizes and validates the given value as an Role.
 *
 * @param value The value to sanitize and validate.
 * @returns The sanitized Role value, defaults to Role.User if validation fails.
 */
export function sanitizeRole(value: unknown): Role {
  return isRole(value) ? value : Role.User;
}
