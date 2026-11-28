import { NextResponse, type NextRequest } from "next/server";

import { accessCookie, backend } from "@/features/auth/server";

// Next.js slash-и охирро мегирад, Fastify онро дар ин роҳҳо талаб мекунад.
const collectionPaths = [
  /^\/workspaces$/,
  /^\/workspaces\/[^/]+\/(?:projects|notifications)$/,
  /^\/workspaces\/[^/]+\/projects\/[^/]+\/(?:states|labels|issues|cycles|modules)$/,
  /^\/workspaces\/[^/]+\/projects\/[^/]+\/issues\/[^/]+\/(?:comments|relations|activity|attachments)$/,
];
const privateHeaders = { "Cache-Control": "no-store" };

function failure(status: number, message: string) {
  return NextResponse.json({ error: { message } }, { status, headers: privateHeaders });
}

async function forwardWorkspace(
  request: NextRequest,
  { params }: { params: Promise<{ segments?: string[] }> },
) {
  const token = request.cookies.get(accessCookie)?.value;
  if (!token) return failure(401, "Sign in to access your workspace.");

  const method = request.method === "HEAD" ? "GET" : request.method;
  const { segments = [] } = await params;
  if (segments.some((segment) => !segment || segment === "." || segment === ".." || /[/\\]/.test(segment) || segment.includes("\0"))) {
    return failure(400, "Invalid workspace path.");
  }
  const path = ["/workspaces", ...segments.map(encodeURIComponent)].join("/");
  const needsSlash = request.nextUrl.pathname.endsWith("/") || collectionPaths.some((pattern) => pattern.test(path));

  let body: string | undefined;
  if (method !== "GET") {
    const host = request.headers.get("host");
    const origin = host ? request.nextUrl.protocol + "//" + host.toLowerCase() : request.nextUrl.origin;
    if (request.headers.get("origin") !== origin) return failure(403, "This request must come from Tracker.");

    body = await request.text();
    const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
    if (body && contentType !== "application/json") return failure(415, "Send the request as JSON.");
  }

  try {
    const response = await backend.request<unknown>({
      method,
      url: path + (needsSlash ? "/" : "") + request.nextUrl.search,
      data: body || undefined,
      headers: {
        Authorization: "Bearer " + token,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      signal: request.signal,
      validateStatus: (status) => (status >= 200 && status < 300) || (status >= 400 && status < 500),
    });

    if (response.status === 204 || response.status === 205) {
      return new NextResponse(null, { status: response.status, headers: privateHeaders });
    }
    return NextResponse.json(response.data ?? null, { status: response.status, headers: privateHeaders });
  } catch {
    return failure(502, "The workspace server is unavailable. Please try again.");
  }
}

export { forwardWorkspace as GET, forwardWorkspace as POST, forwardWorkspace as PATCH, forwardWorkspace as DELETE };
