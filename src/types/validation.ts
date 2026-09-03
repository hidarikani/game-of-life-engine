/**
 * Outcome of a validation check. When `valid` is `false`, `message`
 * explains the failure in human-readable form.
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };
