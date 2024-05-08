import { db } from "~/lib/db.server";
import { ts } from "~/lib/trpc/trpc.server";

export const sessionRouter = ts.router({
  username: ts.procedure.query(async ({ ctx }) => {
    if (ctx.userId == null) return null;

    const { username } = await db.user.findUniqueOrThrow({
      select: { username: true },
      where: { id: ctx.userId },
    });

    return username;
  }),
});
