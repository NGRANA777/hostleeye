import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  
  const isPublicRoute = path === "/login" || path.startsWith("/api/auth/") || path.includes("/api/detect");


  const token = request.cookies.get("auth_token")?.value;

  
  if (path.startsWith("/api/") && !isPublicRoute) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  
  if (!path.startsWith("/api/") && !isPublicRoute && !path.startsWith("/_next") && !path.startsWith("/favicon.ico")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    
    
  }

  
  if (path === "/login" && token) {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
