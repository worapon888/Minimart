import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string; // Google อาจไม่มี role
    } & DefaultSession["user"];

    accessToken?: string; // Google provider อาจไม่ได้ใช้ accessToken จาก Nest
    error?: string;
  }

  interface User extends DefaultUser {
    id: string;
    role?: string;

    // Credentials login เท่านั้นที่มี
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: string;
      image?: string | null;
    };

    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
