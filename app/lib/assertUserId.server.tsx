import { redirect } from "@remix-run/node";
import { unauthorized } from "remix-utils";
import { findSession } from "~/lib/session.server";

type args = { request: Request; throwError?: boolean };

export async function assertUserId({ request, throwError = false }: args) {
  const session = await findSession(request);

  const userId = session.get("userId");

  if (!userId) {
    if (throwError) {
      throw unauthorized(null);
    }

    const url = new URL(request.url);
    throw redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  return { userId, session };
}
