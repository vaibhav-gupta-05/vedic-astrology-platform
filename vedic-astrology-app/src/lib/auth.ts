import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';

// Helper: Get list of admin emails from environment
const getAdminEmails = (): string[] => {
  const envEmails = process.env.ADMIN_EMAILS || 'pandit@astro.com';
  return envEmails.split(',').map(e => e.trim().toLowerCase());
};

const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
};

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Google OAuth (students & admin login with Google) ───────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── Credentials (Pandit Ji / Admin / Student login with email+password) ─────
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const cleanEmail = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: cleanEmail }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Check if email is in ADMIN_EMAILS to always ensure admin role
        const effectiveRole = isAdminEmail(user.email) ? 'ADMIN' : user.role;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: effectiveRole,
        } as any;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth logins: upsert user in DB
      if (account?.provider === 'google' && user.email) {
        const cleanEmail = user.email.trim().toLowerCase();
        const shouldBeAdmin = isAdminEmail(cleanEmail);
        try {
          await prisma.user.upsert({
            where: { email: cleanEmail },
            update: {
              name: user.name ?? undefined,
              // If Pandit Ji signs in with Google, ensure his DB role is ADMIN
              ...(shouldBeAdmin ? { role: 'ADMIN' } : {}),
            },
            create: {
              email: cleanEmail,
              name: user.name ?? '',
              password: '', // No password for Google users
              role: shouldBeAdmin ? 'ADMIN' : 'USER',
            },
          });
        } catch (e) {
          console.error('Google sign-in DB upsert error:', e);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }

      if (token.email) {
        const cleanEmail = (token.email as string).trim().toLowerCase();
        if (isAdminEmail(cleanEmail)) {
          token.role = 'ADMIN';
        } else if (account?.provider === 'google') {
          try {
            const dbUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
            if (dbUser) {
              token.role = dbUser.role;
              token.id = dbUser.id;
            }
          } catch (e) {
            console.error('JWT callback DB fetch error:', e);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role || (isAdminEmail(session.user.email) ? 'ADMIN' : 'USER');
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production',
  pages: {
    signIn: '/',
  }
};
