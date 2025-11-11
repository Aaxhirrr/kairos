import { NextResponse } from "next/server"

import { auth } from "@/auth"

const publicPaths = ["/login", "/api/auth"]

export default auth((req) => {
  const { nextUrl } = req
  const isPublic = publicPaths.some((path) => nextUrl.pathname.startsWith(path))

  if (!req.auth && !isPublic) {
    const loginUrl = new URL("/login", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  if (req.auth && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", nextUrl.origin))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/public).*)"],
}
