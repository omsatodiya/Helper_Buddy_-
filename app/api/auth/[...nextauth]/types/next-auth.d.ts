import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    emailVerified?: boolean | Date | null;
  }

  interface Session {
    user: User & {
      id: string;
      emailVerified?: boolean | Date | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    emailVerified?: boolean | Date | null;
  }
} 