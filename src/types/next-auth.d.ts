/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { AppUser } from "@/types/user"

declare module "next-auth" {
  interface Session {
    user: AppUser
  }

  interface User extends AppUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: AppUser
  }
}
