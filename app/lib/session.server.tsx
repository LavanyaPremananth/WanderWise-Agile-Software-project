import { createId } from "@paralleldrive/cuid2";
import { createSessionStorage, type TypedResponse } from "@remix-run/node";
import { type MaybePromise } from "@trpc/server";
import { createTypedSessionStorage } from "remix-utils";
import { z } from "zod";
import { db } from "~/lib/db.server";

export const { getSession, commitSession, destroySession } =
  createTypedSessionStorage({
    schema: z.object({ userId: z.string().optional() }),
    sessionStorage: createSessionStorage({
      cookie: { secrets: ["C0JBucRCwBFdC7ezQ_YwZ"] },
      async createData(data, expiresAt) {
        const sessionData = JSON.stringify(data);

        const { id } = await db.session.create({
          data: { id: createId(), sessionData, expiresAt },
        });

        return id;
      },
      async readData(id) {
        await cleanup();
        const { sessionData } =
          (await db.session.findUnique({ where: { id } })) ?? {};

        if (!sessionData) return undefined;

        return JSON.parse(sessionData);
      },

      async updateData(id, data, expiresAt) {
        const sessionData = JSON.stringify(data);

        await db.session.upsert({
          where: { id },
          create: { id, sessionData, expiresAt },
          update: { sessionData, expiresAt },
        });
      },

      async deleteData(id) {
        await db.session.deleteMany({ where: { id } });
        await cleanup();
      },
    }),
  });

async function cleanup() {
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}

export async function findSession(request: Request) {
  return await getSession(request.headers.get("Cookie"));
}

type SessionType = Awaited<ReturnType<typeof getSession>>;

export async function withSession<T>(
  request: Request,
  callback: (session: SessionType) => MaybePromise<TypedResponse<T>>,
) {
  const session = await findSession(request);

  const response = await callback(session);

  response.headers.set("Set-Cookie", await commitSession(session));

  return response;
}
