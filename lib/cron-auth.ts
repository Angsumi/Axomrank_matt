export function isAuthorizedCronRequest(
  authHeader: string | null,
  cronSecret?: string
): boolean {
  if (!cronSecret) return true;
  if (!authHeader) return false;
  return authHeader === `Bearer ${cronSecret}`;
}
