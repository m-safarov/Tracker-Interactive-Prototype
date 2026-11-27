import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";

import { accessCookie, backend } from "@/features/auth/server";

function redirectToLogin(request: NextRequest) {
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(accessCookie)?.value;
  if (!token) return redirectToLogin(request);

  try {
    await backend.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    return NextResponse.next();
  } catch (error) {
    if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
      return redirectToLogin(request);
    }
    return new NextResponse("Tracker could not verify your session. Please try again.", {
      status: 503,
    });
  }
}

export const config = {
  matcher: ["/profile/:path*", "/workspaces/:path*"],
};
