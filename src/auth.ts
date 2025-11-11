import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { z } from "zod"

import type { AppUser } from "@/types/user"
import { prisma } from "@/lib/prisma"

const credentialsSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  apiPassphrase: z.string().optional(),
})

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Polymarket",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        apiKey: { label: "API Key", type: "text" },
        apiSecret: { label: "API Secret", type: "text" },
        apiPassphrase: { label: "API Passphrase", type: "text" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials)
        if (!parsed.success) {
          return null
        }
        const { email, name, apiKey, apiSecret, apiPassphrase } = parsed.data

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            name: name?.trim() || email.split("@")[0],
            polymarketApiKey: apiKey?.trim() || null,
            polymarketApiSecret: apiSecret?.trim() || null,
            polymarketApiPassphrase: apiPassphrase?.trim() || null,
          },
          create: {
            email,
            name: name?.trim() || email.split("@")[0],
            polymarketApiKey: apiKey?.trim() || null,
            polymarketApiSecret: apiSecret?.trim() || null,
            polymarketApiPassphrase: apiPassphrase?.trim() || null,
          },
        })

        return user satisfies AppUser
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as AppUser
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.user) {
        session.user = token.user as AppUser
      }
      return session
    },
  },
})
