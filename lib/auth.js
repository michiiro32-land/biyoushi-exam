import NextAuth from 'next-auth';
import LineProvider from 'next-auth/providers/line';
import { upsertUser } from './supabase';

export const authOptions = {
  providers: [
    LineProvider({
      clientId: process.env.LINE_CHANNEL_ID,
      clientSecret: process.env.LINE_CHANNEL_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await upsertUser({
          lineId: user.id,
          displayName: user.name || 'ユーザー',
          avatarUrl: user.image || '',
        });
      } catch (e) {
        console.error('Failed to upsert user:', e);
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.lineId = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
