import NextAuth from 'next-auth';
import { upsertUser } from './supabase';

export const authOptions = {
  providers: [
    {
      id: 'line',
      name: 'LINE',
      type: 'oauth',
      wellKnown: 'https://access.line.me/.well-known/openid-configuration',
      authorization: {
        params: { scope: 'profile openid' },
      },
      clientId: process.env.LINE_CHANNEL_ID,
      clientSecret: process.env.LINE_CHANNEL_SECRET,
      idToken: true,
      checks: ['state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // SupabaseにユーザーをUpsert
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
      // セッションにLINE IDを追加
      if (token?.sub) {
        session.user.lineId = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
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
