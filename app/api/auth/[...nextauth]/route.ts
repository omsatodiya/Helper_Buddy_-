import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

const handler = NextAuth({...authConfig} as any);
export { handler as GET, handler as POST };
