import { redirect, type LoaderArgs } from "@remix-run/node";
import { withSession } from "~/lib/session.server";

export async function loader({ request }: LoaderArgs) {
  return withSession(request, async (session) => {
    session.unset("userId");

    return redirect("/login");
  });
}
