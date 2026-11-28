import axios from "axios";
import type { NextRequest, NextResponse } from "next/server";

export const accessCookie = "tracker_access";
const refreshCookie = "tracker_refresh";

export const backend = axios.create({
  baseURL: process.env.TRACKER_API_URL || "http://127.0.0.1:3000/api/v1",
  timeout: 8_000,
  maxRedirects: 0,
});

export type TokenPair = {
  access_token: string;
  refresh_token: string;
};

function sessionCookieOptions(request: NextRequest) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
  } as const;
}

export function setSessionCookies(request: NextRequest, response: NextResponse, tokens: TokenPair) {
  const options = sessionCookieOptions(request);
  response.cookies.set(accessCookie, tokens.access_token, options);
  response.cookies.set(refreshCookie, tokens.refresh_token, options);
}

export function clearSessionCookies(request: NextRequest, response: NextResponse) {
  const options = { ...sessionCookieOptions(request), maxAge: 0 };
  response.cookies.set(accessCookie, "", options);
  response.cookies.set(refreshCookie, "", options);
}

export function workspaceProjects(slug: string) {
  return `/workspaces/${encodeURIComponent(slug)}/projects`;
}

export function safeNextPath(value: string | undefined) {
  if (!value?.startsWith("/")) return undefined;

  const appOrigin = "https://tracker.invalid";
  try {
    const url = new URL(value, appOrigin);
    const trackerPage = url.pathname === "/profile" || url.pathname.startsWith("/workspaces/") || url.pathname.startsWith("/invitations/");
    if (url.origin === appOrigin && trackerPage) {
      return url.pathname + url.search + url.hash;
    }
  } catch {
    return undefined;
  }
}
