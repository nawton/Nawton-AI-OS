import { auth } from "@/auth";
import type { UserRole } from "@prisma/client";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export type AuthedUser = {
  id: string;
  companyId: string;
  role: UserRole;
};

/**
 * The one place every mutation should start from. Every Server Action that
 * writes data must re-verify the session itself — a bound argument (like a
 * taskId) is client-supplied and not proof of anything on its own. This
 * exists because advanceStatus (tasks board) shipped without it: any
 * signed-in user could mutate any task in any company by id, since the only
 * check was that a session existed at all, not that it owned the resource.
 *
 * Throws rather than returning null so a forgotten check fails loudly in
 * development instead of silently no-op'ing in production.
 */
export async function requireAuth(): Promise<AuthedUser> {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return {
    id: session.user.id,
    companyId: session.user.companyId,
    role: session.user.role as UserRole,
  };
}

const ROLE_RANK: Record<UserRole, number> = { MEMBER: 0, ADMIN: 1, OWNER: 2 };

/**
 * Not called anywhere yet — there's no feature today that should be
 * restricted by role (both current users need equal access to every
 * module). Kept ready so the next OWNER-only feature (e.g. removing a
 * teammate) has a correct, tested primitive to reach for instead of an
 * ad-hoc role check invented at the call site.
 */
export async function requireRole(minimum: UserRole): Promise<AuthedUser> {
  const user = await requireAuth();
  if (ROLE_RANK[user.role] < ROLE_RANK[minimum]) throw new UnauthorizedError();
  return user;
}
