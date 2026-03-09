import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

type AppUser = {
  id: string;
  email: string;
  name: string | null;
  role?: string;
};

type CredentialUser = AppUser & {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null;

        const data: {
          user: AppUser;
          accessToken: string;
          refreshToken: string;
          expiresIn?: number;
        } = await res.json();

        const user: CredentialUser = {
          ...data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn ?? 900,
        };

        return user;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          try {
            const res = await fetch(`${API_BASE}/auth/google-sync`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
              }),
            });

            if (res.ok) {
              const data: {
                user: AppUser;
              } = await res.json();

              token.user = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role,
              };
            } else {
              token.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: token.user?.role,
              };
            }
          } catch {
            token.user = {
              id: user.id,
              email: user.email,
              name: user.name,
              role: token.user?.role,
            };
          }
        } else {
          const credentialUser = user as CredentialUser;

          token.user = {
            id: credentialUser.id,
            email: credentialUser.email,
            name: credentialUser.name,
            role: credentialUser.role,
          };

          token.accessToken = credentialUser.accessToken;
          token.refreshToken = credentialUser.refreshToken;
          token.accessTokenExpires = Date.now() + credentialUser.expiresIn * 1000;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as typeof session.user;
      }

      if (token.accessToken) {
        (session as { accessToken?: string }).accessToken =
          token.accessToken as string;
      }

      return session;
    },
  },

  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
