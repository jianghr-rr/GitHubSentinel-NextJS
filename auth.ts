/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaClient } from '@prisma/client';

const createPrismaClient = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

const db = globalForPrisma.prisma ?? createPrismaClient();

export const config = {
  trustHost: true,
  theme: {
    logo: 'https://next-auth.js.org/img/logo/logo-sm.png',
  },
  adapter: PrismaAdapter(db),
  providers: [
    GitHub,
  ],
  basePath: '/auth',
  callbacks: {
    authorized() {
      // const { pathname } = request.nextUrl;
      // if (pathname.startsWith('/work/')) return !!auth;
      return true;
    },
    jwt({ token, trigger, session }: { token: any, trigger?: string, session?: any }) {
      if (trigger === 'update') token.name = session.user.name;
      return token;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
