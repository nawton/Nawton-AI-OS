import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/server/rate-limit";

const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// A hash of a password nobody will ever type. Comparing against it when the
// account doesn't exist keeps authorize()'s runtime roughly constant either
// way — otherwise "no such user" returns immediately while "wrong password"
// takes ~100ms for bcrypt to run, and that gap is enough to enumerate valid
// emails by timing alone.
const DUMMY_HASH = "$2b$10$H7Q6fhVBrLiT7ggcp9Eu1uc8f05kFfmPFbuPcXGz42DieKbky6NpO";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Credentials provider ships in the box so the MVP runs without any
    // OAuth app registration. Add Google/GitHub providers here later —
    // the User/Account/Session models already support it.
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-post", type: "email" },
        password: { label: "Lösenord", type: "password" },
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const normalizedEmail = email.trim().toLowerCase();
        const ip = request.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown-ip";

        // Two independent buckets: per-email stops someone brute-forcing one
        // account from many IPs; per-IP stops one machine trying many
        // accounts. Neither alone covers both attack shapes.
        const emailLimit = checkRateLimit(`login-email:${normalizedEmail}`, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS);
        const ipLimit = checkRateLimit(`login-ip:${ip}`, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS);
        if (!emailLimit.allowed || !ipLimit.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        // Always compare against *something* — a real hash when the user
        // exists, a fixed dummy one when they don't — so authorize() takes
        // roughly the same time either way. Returning early on "no such
        // user" would let an attacker learn which emails have accounts just
        // by measuring response time.
        const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user?.passwordHash || !valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          companyId: user.companyId,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.companyId = (user as { companyId: string }).companyId;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.companyId = token.companyId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
