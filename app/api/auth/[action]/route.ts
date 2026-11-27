import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";

import { loginRequestSchema, registerRequestSchema } from "@/features/auth/schema";
import { backend, safeNextPath, setSessionCookies, workspaceProjects, type TokenPair } from "@/features/auth/server";

type BackendError = {
  error?: { code?: string; message?: string; details?: { target?: string | string[] } };
};

function failure(status: number, message: string, field?: "email") {
  return NextResponse.json({ error: { message, field } }, { status });
}

function authFailure(error: unknown, action: "login" | "register") {
  if (!axios.isAxiosError<BackendError>(error) || !error.response) {
    return failure(503, "The server is unavailable. Please try again.");
  }

  const { status, data } = error.response;
  const target = data?.error?.details?.target;
  const duplicateEmail =
    data?.error?.message === "An account with this email already exists" ||
    (Array.isArray(target) ? target.includes("email") : target === "email");

  if (action === "register" && status === 409 && duplicateEmail) {
    return failure(409, "An account with this email already exists.", "email");
  }
  if (action === "login" && (status === 401 || status === 403)) {
    return failure(status, "The email or password is incorrect.");
  }
  if (action === "register" && [403, 404, 409, 410].includes(status)) {
    return failure(status, "This invitation is invalid, expired, used, or belongs to another email.");
  }
  if (status === 429) {
    return failure(429, "Too many attempts. Please wait a minute and try again.");
  }
  if (status === 400) {
    return failure(400, "Check your details and try again.");
  }
  return failure(502, "Authentication is temporarily unavailable. Please try again.");
}

export async function POST(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (action !== "login" && action !== "register") {
    return failure(404, "Unknown authentication request.");
  }

  const origin = request.headers.get("origin");
  const contentType = request.headers.get("content-type")?.split(";")[0].trim();
  if (origin && origin !== request.nextUrl.origin) {
    return failure(403, "This request must come from Tracker.");
  }
  if (contentType !== "application/json") {
    return failure(415, "Send the request as JSON.");
  }

  const body: unknown = await request.json().catch(() => null);

  try {
    let tokens: TokenPair;
    let destination = "/workspaces/new";

    if (action === "register") {
      const parsed = registerRequestSchema.safeParse(body);
      if (!parsed.success) {
        return failure(400, parsed.error.issues[0]?.message ?? "Check your details and try again.");
      }

      if (parsed.data.invite_token) {
        const { data: invite } = await backend.get<{ workspace: { slug: string } }>(
          `/invites/${encodeURIComponent(parsed.data.invite_token)}`,
        );
        destination = workspaceProjects(invite.workspace.slug);
      }

      ({ data: tokens } = await backend.post<TokenPair>("/auth/register", parsed.data));
    } else {
      const parsed = loginRequestSchema.safeParse(body);
      if (!parsed.success) {
        return failure(400, parsed.error.issues[0]?.message ?? "Check your details and try again.");
      }

      const { next, ...credentials } = parsed.data;
      ({ data: tokens } = await backend.post<TokenPair>("/auth/login", credentials));

      const requestedPath = safeNextPath(next);
      if (requestedPath) {
        destination = requestedPath;
      } else {
        const workspaces = await backend
          .get<{ slug: string }[]>("/workspaces/", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          })
          .catch(() => null);
        const workspace = workspaces?.data[0];
        if (workspace) destination = workspaceProjects(workspace.slug);
      }
    }

    const response = NextResponse.json(
      { destination },
      { status: action === "register" ? 201 : 200, headers: { "Cache-Control": "no-store" } },
    );
    setSessionCookies(request, response, tokens);
    return response;
  } catch (error) {
    return authFailure(error, action);
  }
}
