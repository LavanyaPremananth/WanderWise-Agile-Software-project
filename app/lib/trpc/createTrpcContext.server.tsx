import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { commitSession, getSession } from "~/lib/session.server";

export async function createTrpcContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const session = await getSession(req.headers.get("Cookie"));
  const userId = session.get("userId");

  async function commit() {
    resHeaders.append("Set-Cookie", await commitSession(session));
  }

  return { session, userId, commit };
}
